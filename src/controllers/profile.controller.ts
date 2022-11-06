import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';

import ErrorResponse from '../utils/Error';
import asyncHandler from '../middleware/asyncHandler';
import { UpdateUserInfoType } from '../schemas/profile.schema';
import User from '../models/user.model';

// @route   GET /api/v2/users/myprofile
// @desc    Get user's profile
// @access  Private
export const getProfileHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      success: true,
      data: res.locals.user,
    });
  }
);

// @route   GET /api/v2/users/myprofile
// @desc    Get user's profile
// @access  Private
export const updateUserInfoHandler = asyncHandler(
  async (
    req: Request<{}, {}, UpdateUserInfoType>,
    res: Response,
    next: NextFunction
  ) => {
    const { telephone, name, password } = req.body;

    const user = await User.findById(res.locals.user._id);

    if (!user) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre", 401)
      );
    }

    user.name = name || user.name;
    user.telephone = telephone || user.telephone;
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save({ validateBeforeSave: true });
    const data = {
      name: updatedUser.name,
      telephone: updatedUser.telephone,
      email: updatedUser.email,
    };

    return res.status(200).json({
      success: true,
      data,
    });
  }
);
