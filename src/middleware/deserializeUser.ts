import { Request, Response, NextFunction } from 'express';

import { verifyJwt } from '../utils/jwt';
import ErrorResponse from '../utils/Error';

function deserializeUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.jwt || req.headers.authorization) {
    return next();
  }

  const accessToken = req.headers.authorization || req.session.jwt || '';

  if (!accessToken) {
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken);

  if (expired) {
    return next(
      new ErrorResponse("Vous n'êtes pas authorisé à poursuivre", 401)
    );
  }

  res.locals.decoded = decoded;

  return next();
}

export default deserializeUser;
