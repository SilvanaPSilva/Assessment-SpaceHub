import {env} from '../config/env';
import mongoose from 'mongoose';

const uri = env.mongoURI ;

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
}


export const connectDB = async (): Promise<void> => {
  try {
    //console.log(`Connecting to MongoDB at ${uri}`);
    console.log(`Connecting to MongoDB at...`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected (Mongoose): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
