import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

import User, { UserDocument } from '../models/user.model';

export async function registerUser(
  data: DocumentDefinition<
    Omit<
      UserDocument,
      | 'createdAt'
      | 'updatedAt'
      | 'type '
      | 'isActive'
      | 'isBlock'
      | 'loginTriedCount'
      | 'activeAccountToken'
      | 'activeAccountExpire'
      | 'resetPasswordToken'
      | 'resetPasswordExpire'
      | 'blockAccountExpire'
      | 'comparePassword'
      | 'getActivationAccountToken'
      | 'getResetPasswordToken'
    >
  >
) {
  return await User.create(data);
}

export async function getUserWithQuery(
  query: FilterQuery<UserDocument>,
  options: QueryOptions = { lean: true }
) {
  return await User.findOne(query, {}, options);
}

export async function findAndUpdateUser(
  userId: string,
  update: UpdateQuery<UserDocument>
) {
  return await User.findByIdAndUpdate(userId, update);
}

export async function findUserByEmailAndUpdate(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>
) {
  return await User.findOneAndUpdate(query, update);
}
