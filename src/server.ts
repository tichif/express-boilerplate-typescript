import http from 'http';

require('dotenv').config();

import app from './app';
import config from './config';
import connectDB from './utils/connectDB';
import Logging from './utils/log';

const server = http.createServer(app);

async function startServer() {
  await connectDB();

  server.listen(config.port, () =>
    Logging.info(`App is running on port ${config.port}`)
  );
}

startServer();
