import mongoose from 'mongoose';

import config from '../config';
import Logging from './log';

const connectDB = async () => {
  try {
    if (typeof config.mongoUri === 'string') {
      const conn = await mongoose.connect(config.mongoUri);
      Logging.info(`Database connected: ${conn.connection.host}`);
    }
  } catch (error: any) {
    Logging.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
