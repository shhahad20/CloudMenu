export interface CustomRequest extends Request {
    user?: { role: string, userId: string };
  }

