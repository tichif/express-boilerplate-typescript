import { FilterQuery, QueryOptions } from 'mongoose';

import User, { UserDocument } from '../models/user.model';

export async function findUserByEmail(email: string) {
  return await User.findOne({ email }).select('+password');
}

export async function findUserById(
  userId: string,
  options: QueryOptions = { lean: true }
) {
  return await User.findById(userId, {}, options).select(
    'name email type isActive'
  );
}

export async function getUsers(
  query: FilterQuery<UserDocument>,
  limit: number,
  skip: number,
  sort: string = '-createdAt',
  select?: string
) {
  if (select) {
    return await User.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } else {
    return await User.find(query).sort(sort).skip(skip).limit(limit);
  }
}

export async function countUsers() {
  return await User.countDocuments();
}
