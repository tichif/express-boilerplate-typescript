import { Router } from 'express';

import {
  activeUserAccountHandler,
  loginUserHandler,
  logoutUserHandler,
  registerUserHandler,
  resendEmailHandler,
  resetPasswordHandler,
  sendMailForResetPasswordHandler,
} from '../controllers/auth.controller';
import {
  activeUserAccountSchema,
  loginUserSchema,
  registerUserSchema,
  resendEmailSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';
import validate from '../middleware/validate';
import { requiredUser } from '../middleware/auth';
import cleanCache from '../middleware/cleanCache';

const router = Router();

router.post(
  '/register',
  validate(registerUserSchema),
  cleanCache,
  registerUserHandler
);

router.get(
  '/activeaccount/:activeToken',
  validate(activeUserAccountSchema),
  activeUserAccountHandler
);

router.post('/login', validate(loginUserSchema), loginUserHandler);

router.post('/resendemail', validate(resendEmailSchema), resendEmailHandler);

router.post(
  '/resetpassword',
  validate(resendEmailSchema),
  sendMailForResetPasswordHandler
);

router.post(
  '/resetpassword/:resetToken',
  validate(resetPasswordSchema),
  resetPasswordHandler
);

router.post('/logout', requiredUser, logoutUserHandler);

export default router;
