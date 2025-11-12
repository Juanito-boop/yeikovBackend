import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware genérico para validar datos usando Zod.
 * Puede validar body, params y query según lo que defina el esquema.
 */
export const validate =
  (schema: z.ZodType<any>) =>
    (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Se combinan body, params y query para admitir validaciones mixtas
        const data = {
          ...req.body,
          ...req.params,
          ...req.query,
        };

        schema.parse(data);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errores = error.issues.map((e) => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          }));

          res.status(400).json({
            status: 'error',
            message: 'Validación fallida',
            errores,
          });
          return;
        }

        res.status(500).json({
          status: 'error',
          message: 'Error interno de validación',
        });
      }
    };
