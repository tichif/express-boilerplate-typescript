import { Request, Response, NextFunction } from 'express';

import asyncHandler from '../middleware/asyncHandler';
import { ContactType } from '../schemas/contact.schema';
import sendMail from '../utils/sendMail';
import config from '../config';

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
      html: `
      <html>
      <body>
        <p>Hello ${config.enterpriseName},</p>
        <p>Je suis ${name}, adresse mail: <a href="mailto:${email}">${email}</a></p>
        <p>J'écris au sujet de: ${subject}</p>
        <p>${message}</p>
      </body>
    </html>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Message envoyé. Merci de nous avoir contacté.',
    });
  }
);
