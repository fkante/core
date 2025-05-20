import "express";

// Define a type for the user object attached to req.user by auth middleware
// This should match the structure of `currentUser` in the `protect` middleware in auth.ts
// and the columns selected from usersTable.
type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  verified: boolean;
};

declare global {
  namespace Express {
    // Extend the Express Request interface
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// This empty export makes the file a module, which can sometimes help with global augmentations discovery.
// Depending on tsconfig, it might not be strictly necessary.
export {};
