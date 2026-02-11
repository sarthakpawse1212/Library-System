import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

// Runs express-validator chains and returns 422 if any fail
export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all chains in parallel
    await Promise.all(chains.map((chain) => chain.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(
        res,
        'Validation failed',
        422,
        errors.array().map((e) => ({ field: e.type === 'field' ? e.path : e.type, message: e.msg }))
      );
      return;
    }

    next();
  };
}
