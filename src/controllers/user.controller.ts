import { Request, Response, NextFunction } from 'express';
import { omit } from 'lodash';

import asyncHandler from '../middleware/asyncHandler';
import { AdvancedResultType } from '../schemas/advancedResult.schema';
import { GetUserIdType } from '../schemas/user.schema';
import { countUsers, findUserById, getUsers } from '../services/user.service';
import ErrorResponse from '../utils/Error';
import client from '../utils/redis';

// @route   GET /api/v2/users
// @desc    Get all users
// @access  Private - Admin
export const getUsersHandler = asyncHandler(
  async (
    req: Request<{}, {}, {}, AdvancedResultType>,
    res: Response,
    next: NextFunction
  ) => {
    // check cached data
    const cachedData = await client.get(req.url);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...JSON.parse(cachedData),
      });
    }

    let sort: string = '';
    let select: string = '';
    // copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'limit', 'sort', 'page'];

    // Loop over removeFields and delete them from reqQuery
    // @ts-ignore
    removeFields.forEach((param: string) => delete reqQuery[param]);

    // create a query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operator like $gt, $gte, $lt, $lte, $in
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // select fields
    if (req.query.select) {
      select = req.query.select.split(',').join(' ');
    }

    // sort fields
    if (req.query.sort) {
      sort = req.query.sort.split(',').join(' ');
    }

    // Pagination
    let page: number;
    let limit: number;
    if (req.query.page) {
      page = +req.query.page;
    } else {
      page = 1;
    }
    if (req.query.limit) {
      limit = +req.query.limit;
    } else {
      limit = 10;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await countUsers();

    const result = await getUsers(
      JSON.parse(queryStr),
      limit,
      startIndex,
      sort,
      select
    );

    // pagination result
    const pagination: {
      next?: {
        page: number;
        limit: number;
      };
      prev?: {
        page: number;
        limit: number;
      };
    } = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    const dataToCached = {
      count: result.length,
      pagination,
      data: result,
    };
    await client.set(req.url, JSON.stringify(dataToCached), {
      EX: 5 * 60, //5mn
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      pagination,
      data: result,
    });
  }
);

// @route   GET /api/v2/users/:userId
// @desc    Get an user
// @access  Private - Admin
export const getUserHandler = asyncHandler(
  async (req: Request<GetUserIdType>, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const key = req.url;

    const cachedData = await client.get(key);

    // cached data
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return next(
        new ErrorResponse("Désolé, cet utilisateur n'existe pas.", 404)
      );
    }

    await client.set(key, JSON.stringify(user), {
      EX: 5 * 60, // 5mn
    });

    return res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// @route   PATCH /api/v2/users/:userId
// @desc    Update user's role
// @access  Private - Admin
export const updateUserRoleHandler = asyncHandler(
  async (req: Request<GetUserIdType>, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await findUserById(userId, { lean: false });

    if (!user) {
      return next(
        new ErrorResponse("Désolé, cet utilisateur n'existe pas.", 404)
      );
    }

    if (user._id.toString() === res.locals.user._id.toString()) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre.", 401)
      );
    }

    user.type = user.type === 'admin' ? 'user' : 'admin';
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      data: omit(updatedUser.toJSON(), [
        'updatedAt',
        'createdAt',
        '__v',
        'isActive',
        'loginTriedCount',
        'activeAccountExpire',
        'activeAccountToken',
        'resetPasswordExpire',
        'resetPasswordToken',
        'blockAccountExpire',
      ]),
    });
  }
);

// @route   DELETE /api/v2/users/:userId
// @desc    Delete user
// @access  Private - Admin
export const deleteUserHandler = asyncHandler(
  async (req: Request<GetUserIdType>, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await findUserById(userId, { lean: false });

    if (!user) {
      return next(
        new ErrorResponse("Désolé, cet utilisateur n'existe pas.", 404)
      );
    }

    if (user._id.toString() === res.locals.user._id.toString()) {
      return next(
        new ErrorResponse("Vous n'êtes pas authorisé à poursuivre.", 401)
      );
    }

    await user.remove();

    return res.status(200).json({
      success: true,
      data: 'Utilisateur supprimé avec succès.',
    });
  }
);
