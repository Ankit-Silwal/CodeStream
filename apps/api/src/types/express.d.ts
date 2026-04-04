declare global {
  namespace Express {
    export interface Request {
      user?: any;
      userId?: string;
    }
  }
}

export {};
