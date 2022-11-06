import { Router } from 'express';

import { contactHandler } from '../controllers/contact.controller';
import { contactSchema } from '../schemas/contact.schema';
import validate from '../middleware/validate';

const router = Router();

router.post('/', validate(contactSchema), contactHandler);

export default router;
