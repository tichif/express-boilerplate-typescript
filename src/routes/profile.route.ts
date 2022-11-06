import { Router } from 'express';

import validate from '../middleware/validate';
import { requiredUser } from '../middleware/auth';
import {
  getProfileHandler,
  updateUserInfoHandler,
} from '../controllers/profile.controller';
import { updateUserInfoSchema } from '../schemas/profile.schema';

const router = Router();

router.get('/myprofile', requiredUser, getProfileHandler);

router.put(
  '/update',
  requiredUser,
  validate(updateUserInfoSchema),
  updateUserInfoHandler
);

export default router;
