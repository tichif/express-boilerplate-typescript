import { Request, Response, NextFunction } from 'express';

import asyncHandler from '../middleware/asyncHandler';
import { ContactType } from '../schemas/contact.schema';
import sendMail from '../utils/sendMail';
import config from '../config';
import { contactTemplate } from '../templates/contact.template';

// @route   GET /api/v2/contact
// @desc    Contact the company
// @access  Public
export const contactHandler = asyncHandler(
  async (
    req: Request<{}, {}, ContactType>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, subject, message } = req.body;

    await sendMail({
      from: config.fromEmail,
      to: config.toEmail,
      subject,
      html: contactTemplate({ name, email, subject, message }),
    });

    return res.status(200).json({
      success: true,
      message: 'Message envoyé. Merci de nous avoir contacté.',
    });
  }
);
