import { Express } from 'express';

import contactRoute from './contact.route';
import authRoutes from './auth.route';
import profileRoute from './profile.route';
import userRoute from './user.route';

export default function (app: Express) {
  // contact
  app.use('/api/v2/contact', contactRoute);

  // authentication
  app.use('/api/v2/auth', authRoutes);

  // Profile
  app.use('/api/v2/profile', profileRoute);

  // users
  app.use('/api/v2/users', userRoute);
}
