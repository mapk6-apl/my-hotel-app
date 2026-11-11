import type { Request, Response } from 'express';
import app, { validateAppEnvironment } from '../../server/src/app.js';

let environmentValidated = false;

export default (request: Request, response: Response): void => {
  if (!environmentValidated) {
    validateAppEnvironment();
    environmentValidated = true;
  }

  app(request, response);
};
