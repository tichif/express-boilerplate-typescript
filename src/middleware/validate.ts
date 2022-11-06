import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

import Logging from '../utils/log';

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      return next();
    } catch (error: any) {
      Logging.error(error);
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
  };

export default validate;
