import { createConnection } from 'typeorm';
import { User } from './models/User';
import { Event } from './models/Event';
import { SwapRequest } from './models/SwapRequest';

export const initializeDatabase = async () => {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'slotswapper',
      entities: [User, Event, SwapRequest],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    });

    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
