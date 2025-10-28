import { Router, type Request, type Response } from 'express';
import type { Router as ExpressRouter } from 'express';

export const apiRouter: ExpressRouter = Router();

// Example route
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      users: '/api/users',
    },
  });
});

// Example users route
apiRouter.get('/users', (_req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// Example POST route
apiRouter.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  
  // This is just an example - add proper validation in production
  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
    },
  });
});

