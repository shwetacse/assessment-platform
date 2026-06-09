import { NextRequest, NextResponse } from 'next/server';
import { unauthorized, forbidden, serverError } from './api-response';

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>;

/**
 * Wraps a route handler and converts thrown auth errors into proper HTTP responses.
 * Keeps route handlers focused on business logic (Single Responsibility).
 */
export function withErrorHandling(handler: Handler): Handler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') return unauthorized();
      if (err.message === 'FORBIDDEN') return forbidden();
      console.error('[Route Error]', err);
      return serverError();
    }
  };
}
