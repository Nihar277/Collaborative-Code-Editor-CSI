// collaborative-code-editor/backend/types/express/index.d.ts
import { IUser } from '../../src/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: any; // You can use IUser if you want to be more specific
    }
  }
}