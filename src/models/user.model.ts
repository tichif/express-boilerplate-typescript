import crypto from 'crypto';

import mongoose, { Document } from 'mongoose';
import argon2 from 'argon2';

import Logging from '../utils/log';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  telephone: string;
  type: 'user' | 'admin';
  isActive: boolean;
  isBlock: boolean;
  loginTriedCount: number;
  activeAccountToken: string | undefined;
  activeAccountExpire: Date | undefined;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  blockAccountExpire: Date | undefined;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getActivationAccountToken(): string;
  getResetPasswordToken(): string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    // @ts-ignore
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire.'],
      maxlength: [150, 'Le nom ne peut pas dépasser 150 caractères.'],
      minlength: [3, 'Le nom doit contenir au moins 3 caractères.'],
      match: [/^[a-zA-ZÀ-ÿ-. ]*$/, 'Le nom est incorrect.'],
      trim: true,
    },
    // @ts-ignore
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: [true, 'Cet email existe déja. Choisissez un autre.'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "L'email est incorrect.",
      ],
      trim: true,
    },
    // @ts-ignore
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      select: false,
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        'Le mot de passe doit contenir au moins un chiffre - au moins une lettre majuscule - au moins une lettre minuscule et un caractère spécial.',
      ],
    },
    // @ts-ignore
    telephone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire.'],
      match: [/^\d{8}$/, 'Le numéro de téléphone est incorrect. (55555555)'],
    },
    // @ts-ignore
    type: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // @ts-ignore
    isActive: {
      type: Boolean,
      default: false,
    },
    // @ts-ignore
    isBlock: {
      type: Boolean,
      default: false,
    },
    // @ts-ignore
    loginTriedCount: {
      type: Number,
      default: 0,
    },
    // @ts-ignore
    activeAccountToken: String,
    // @ts-ignore
    activeAccountExpire: Date,
    // @ts-ignore
    resetPasswordToken: String,
    // @ts-ignore
    resetPasswordExpire: Date,
    // @ts-ignore
    blockAccountExpire: Date,
  },
  {
    timestamps: true,
  }
);

// hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // generate hash password
  const hash = await argon2.hash(this.password);
  this.password = hash;
  return next();
});

// compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const self = this as UserDocument;

    return await argon2.verify(self.password, candidatePassword);
  } catch (error) {
    Logging.error('Could not verify password');
    return false;
  }
};

// Generate ActivationToken
userSchema.methods.getActivationAccountToken = function () {
  const self = this as UserDocument;

  const activeToken = crypto.randomBytes(20).toString('hex');

  self.activeAccountToken = crypto
    .createHash('sha256')
    .update(activeToken)
    .digest('hex');
  self.activeAccountExpire = new Date(Date.now() + 10 * 60 * 1000); // 10mn

  return activeToken;
};

// Generate PasswordResetToken
userSchema.methods.getResetPasswordToken = function () {
  const self = this as UserDocument;

  const resetToken = crypto.randomBytes(20).toString('hex');

  self.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  self.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10mn

  return resetToken;
};

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
