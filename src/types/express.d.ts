declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        tenantId: string;
        permissions?: Array<{ module: string; action: string }>;
        roles?: Array<{ name: string }>;
      };
    }
  }
}
