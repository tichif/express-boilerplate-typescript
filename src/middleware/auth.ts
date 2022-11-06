import { Request, Response, NextFunction } from 'express';

import asyncHandler from './asyncHandler';
import ErrorResponse from '../utils/Error';
import { findUserById } from '../services/user.service';

export const requiredUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals?.decoded?.userId;

    if (!userId) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre", 401)
      );
    }

    const user = await findUserById(userId);

    if (!user) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre", 401)
      );
    }

    res.locals.user = user;
    next();
  }
);

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.user.type)) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre", 401)
      );
    }
    next();
  };
};
