import crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';

import asyncHandler from '../middleware/asyncHandler';
import ErrorResponse from '../utils/Error';
import {
  getUserWithQuery,
  findAndUpdateUser,
  findUserByEmailAndUpdate,
  registerUser,
} from '../services/auth.service';
import {
  ActiveUserAccountType,
  LoginUserType,
  RegisterUserType,
  ResendEmailType,
  ResetPasswordType,
} from '../schemas/auth.schema';
import { findUserByEmail } from '../services/user.service';
import sendMail from '../utils/sendMail';
import Logging from '../utils/log';
import config from '../config';
import { signJwt } from '../utils/jwt';

// @route   POST /api/v2/register
// @desc    Register a user
// @access  Public
export const registerUserHandler = asyncHandler(
  async (
    req: Request<{}, {}, RegisterUserType>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, telephone, password } = req.body;

    const user = await findUserByEmail(email);

    if (user) {
      return next(
        new ErrorResponse(
          'Cet email existe déja. Veuillez choisir un autre',
          400
        )
      );
    }

    const createdUser = await registerUser({
      name,
      email,
      telephone,
      password,
      type: 'user',
    });

    const activeToken = createdUser.getActivationAccountToken();
    await createdUser.save({ validateBeforeSave: false });

    try {
      sendMail({
        from: config.fromEmail,
        to: email,
        subject: "Email d'activation de compte",
        html: `
        <html>
      <body>
        <p>Hello ${name},</p>
        <p>Ceci est un email concernant l'activation de votre compte, veuillez cliquer sur ce lien valable pendent 10 minutes:</p>
        <p><a href="${config.addressServer}/auth/activeaccount/${activeToken}">${config.addressServer}/auth/activeaccount/${activeToken}</a></p>
        <img src=${config.logoAddress} alt="logo" style="height: 80px; width: 80px;">
        <p>Cordialement, ${config.enterpriseName}.</p>
      </body>
    </html>
        `,
      });
      return res.status(201).json({
        success: true,
        message:
          'Compte créé. Veuilez visiter votre boite mail pour valider votre compte',
      });
    } catch (error: any) {
      Logging.error(error);
      createdUser.activeAccountToken = undefined;
      createdUser.activeAccountExpire = undefined;
      await createdUser.save({ validateBeforeSave: false });
    }
  }
);

// @route   GET /api/v2/auth/activeaccount/:activeToken
// @desc    Active user account
// @access  Public
export const activeUserAccountHandler = asyncHandler(
  async (
    req: Request<ActiveUserAccountType>,
    res: Response,
    next: NextFunction
  ) => {
    const { activeToken } = req.params;

    const hashed = crypto
      .createHash('sha256')
      .update(activeToken)
      .digest('hex');

    const user = await getUserWithQuery(
      {
        activeAccountToken: hashed,
        activeAccountExpire: { $gt: Date.now() },
      },
      { lean: false }
    );

    if (!user) {
      return next(new ErrorResponse('Token invalid', 400));
    }

    user.isActive = true;
    user.activeAccountExpire = undefined;
    user.activeAccountToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Compte activé avec succès.',
    });
  }
);

// @route   POST /api/v2/auth/login
// @desc    Log in user
// @access  Public
export const loginUserHandler = asyncHandler(
  async (
    req: Request<{}, {}, LoginUserType>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    // find user
    const user = await findUserByEmail(email);

    if (!user) {
      return next(new ErrorResponse('Email ou mot de passe incorrect', 422));
    }

    // check if the account is blocked
    const accountBlocked = await getUserWithQuery(
      {
        email,
        blockAccountExpire: { $gt: Date.now() },
      },
      {
        lean: false,
      }
    );
    if (accountBlocked) {
      await findUserByEmailAndUpdate(
        { email },
        { $set: { loginTriedCount: 0, isBlocked: true } }
      );
      return next(
        new ErrorResponse('Votre compte est suspendu pendant 24 heures.', 401)
      );
    } else {
      await findUserByEmailAndUpdate(
        { email },
        { $set: { blockAccountExpire: undefined, isBlock: false } }
      );
    }

    // blog user if the loginTriedCount === 3
    if (user.loginTriedCount === 3) {
      await findUserByEmailAndUpdate(
        { email },
        {
          $set: {
            isBlock: true,
            blockAccountExpire: new Date(Date.now() + 1000 * 60 * 60 * 24), //24h
          },
        }
      );
      return next(
        new ErrorResponse('Votre compte est suspendu pendant 24 heures.', 401)
      );
    }

    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      // increment the loginTriedCOunt
      await findUserByEmailAndUpdate(
        { email },
        { $inc: { loginTriedCount: 1 } }
      );
      return next(new ErrorResponse('Email ou mot de passe incorrect', 422));
    }

    // reinitialize all fields if user enter correct infos
    await findUserByEmailAndUpdate(
      { email },
      {
        $set: {
          isBlock: false,
          blockAccountExpire: undefined,
          loginTriedCount: 0,
        },
      }
    );

    // check if the count is activated
    if (!user.isActive) {
      return next(new ErrorResponse("Ce compte n'est pas encore activé.", 401));
    }

    // generate token
    const token = signJwt(
      { userId: user._id },
      {
        expiresIn: '1h',
      }
    );

    req.session = {
      jwt: token,
    };

    return res.status(200).json({
      success: true,
    });
  }
);

// @route   POST /api/v2/auth/resendemail
// @desc    Resend action email
// @access  Public
export const resendEmailHandler = asyncHandler(
  async (
    req: Request<{}, {}, ResendEmailType>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        data: 'Email envoyé.',
      });
    }

    if (user.isActive) {
      return next(new ErrorResponse('Ce compte est déja activé.', 401));
    }

    const activeToken = user.getActivationAccountToken();

    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        from: config.fromEmail,
        to: email,
        subject: "Email d'activation de compte",
        html: `
        <html>
      <body>
        <p>Hello ${user.name},</p>
        <p>Ceci est un email concernant l'activation de votre compte, veuillez cliquer sur ce lien valable pendent 10 minutes:</p>
        <p><a href="${config.addressServer}/auth/activeaccount/${activeToken}">${config.addressServer}/auth/activeaccount/${activeToken}</a></p>
        <img src=${config.logoAddress} alt="logo" style="height: 80px; width: 80px;">
        <p>Cordialement, ${config.enterpriseName}.</p>
      </body>
    </html>
        `,
      });
      return res.status(200).json({
        success: true,
        data: 'Email envoyé.',
      });
    } catch (error: any) {
      Logging.error(error);
      user.activeAccountToken = undefined;
      user.activeAccountExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }
);

// @route   POST /api/v2/auth/resetpassword
// @desc    Send mail for reset password
// @access  Public
export const sendMailForResetPasswordHandler = asyncHandler(
  async (
    req: Request<{}, {}, ResendEmailType>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        data: 'Email envoyé.',
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    try {
      await sendMail({
        from: config.fromEmail,
        to: email,
        subject: 'Email de réinitialisation de mot passe',
        html: `
        <html>
      <body>
        <p>Hello ${user.name},</p>
        <p>Vous recevez ce message parce que vous (ou quelqu'un d'autre) avez fait la requête de réinitialiser le mot de passe de votre compte. Veuillez cliquer sur ce lien valable pendant 10 minutes:</p>
        <p><a href="${config.addressServer}/auth/resetpassword/${resetToken}">${config.addressServer}/auth/resetpassword/${resetToken}</a></p>
        <p>Si ce n'est pas vous, ne vous occupez pas de ce message.</p>
        <img src=${config.logoAddress} alt="logo" style="height: 80px; width: 80px;">
        <p>Cordialement, ${config.enterpriseName}.</p>
      </body>
    </html>
        `,
      });
      return res.status(200).json({
        success: true,
        data: 'Email envoyé.',
      });
    } catch (error: any) {
      Logging.error(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }
);

// @route   POST /api/v2/auth/resetpassword/:resetToken
// @desc    Reset Password
// @access  Public
export const resetPasswordHandler = asyncHandler(
  async (
    req: Request<ResetPasswordType['params'], {}, ResetPasswordType['body']>,
    res: Response,
    next: NextFunction
  ) => {
    const { resetToken } = req.params;

    const token: string = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const { password } = req.body;

    const user = await getUserWithQuery(
      {
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      },
      {
        lean: false,
      }
    );

    if (!user) {
      return next(new ErrorResponse('Token invalide', 400));
    }

    user.password = password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: true });

    return res.status(200).json({
      success: true,
      data: 'Mot de passe réinitialisé avec succès.',
    });
  }
);

// @route   POST /api/v2/auth/logout
// @desc    Get user's profile
// @access  Private
export const logoutUserHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.locals.user = undefined;

    return res.status(200).json({
      success: true,
      data: {},
    });
  }
);
