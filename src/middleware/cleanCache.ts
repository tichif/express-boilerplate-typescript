import { Request, Response, NextFunction } from 'express';

import { clearCache } from '../utils/redis';

async function cleanCache(req: Request, res: Response, next: NextFunction) {
  await next();

  await clearCache();
}

export default cleanCache;
