import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';

const authService = new AuthService();
const userRepository = AppDataSource.getRepository(User);

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      // Obtener el usuario completo con su rol
      const user = await userRepository.findOne({
        where: { id: req.user.userId },
        relations: ['role']
      });

      if (!user) {
        res.status(401).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!allowedRoles.includes(user.role.nombre)) {
        res.status(403).json({
          error: 'No tienes permisos para acceder a este recurso',
          requiredRoles: allowedRoles,
          yourRole: user.role.nombre
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Error al verificar permisos' });
    }
  };
};
