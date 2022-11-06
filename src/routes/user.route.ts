import { Router } from 'express';

import validate from '../middleware/validate';
import { authorize, requiredUser } from '../middleware/auth';
import { advancedResultSchema } from '../schemas/advancedResult.schema';
import {
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
  updateUserRoleHandler,
} from '../controllers/user.controller';
import { getUserIdSchema } from '../schemas/user.schema';
import cleanCache from '../middleware/cleanCache';

const router = Router();

router.get(
  '/',
  requiredUser,
  authorize('admin'),
  validate(advancedResultSchema),
  getUsersHandler
);

router
  .route('/:userId')
  .get(
    requiredUser,
    authorize('admin'),
    validate(getUserIdSchema),
    getUserHandler
  )
  .patch(
    requiredUser,
    authorize('admin'),
    validate(getUserIdSchema),
    cleanCache,
    updateUserRoleHandler
  )
  .delete(
    requiredUser,
    authorize('admin'),
    validate(getUserIdSchema),
    cleanCache,
    deleteUserHandler
  );

export default router;
