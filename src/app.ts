import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieSession from 'cookie-session';

import Logging from './utils/log';
import errorHandler from './middleware/error';
import ErrorResponse from './utils/Error';
import routes from './routes';
import deserializeUser from './middleware/deserializeUser';
import config from './config';

const app = express();

function logRequestAndResponse() {
  app.use((req, res, next) => {
    // log incoming request
    Logging.info(
      `INCOMING -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    // log outgoing response
    res.on('finish', () => {
      Logging.info(
        `OUTGOING -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });
    next();
  });
}

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10mn
  max: 50,
});

// middleware
app.use(express.json());
app.use(hpp());
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(
  cookieSession({
    name: 'tk-session',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 1000 * 60 * 60 * 24, // 1d
    keys: config.keys,
    httpOnly: process.env.NODE_ENV === 'production' ? false : true,
    path: '/',
    domain: config.cookieDomain,
  })
);
// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.cors);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  next();
});

logRequestAndResponse();

app.use(deserializeUser);
// routes
routes(app);
app.get('/ping', (req, res, next) => {
  return res.status(200).json({ message: 'ok' });
});

app.use(errorHandler);

// Implement unsupported routes error
app.use((req, res, next) => {
  const error = new ErrorResponse("Cette route n'existe pas.", 404);
  next(error);
});

export default app;
