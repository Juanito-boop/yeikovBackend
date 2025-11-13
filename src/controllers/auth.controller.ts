import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../database/data-source';
import { Role, RoleType } from '../entities/Role';

const authService = new AuthService();
const roleRepository = AppDataSource.getRepository(Role);

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      let data: RegisterInput = req.body;
      const sendEmail = req.body.sendWelcomeEmail !== false; // Por defecto true

      // Si se envió 'role' como string, convertirlo a roleId
      if (req.body.role && !data.roleId) {
        const roleMap: Record<string, RoleType> = {
          'docente': RoleType.DOCENTE,
          'admin': RoleType.ADMIN,
          'administrador': RoleType.ADMIN,
          'decano': RoleType.DECANO,
          'director': RoleType.DIRECTOR,
          'director_academico': RoleType.DIRECTOR
        };

        const roleName = roleMap[req.body.role.toLowerCase()];
        if (!roleName) {
          res.status(400).json({ error: 'Rol inválido' });
          return;
        }

        const role = await roleRepository.findOne({ where: { nombre: roleName } });
        if (!role) {
          res.status(400).json({ error: 'Rol no encontrado en el sistema' });
          return;
        }

        data = { ...data, roleId: role.id };
      }

      const result = await authService.register(data, sendEmail);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: result.user.id,
          email: result.user.email,
          nombre: result.user.nombre,
          apellido: result.user.apellido
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(data, ipAddress, userAgent);

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: result.user.id,
          email: result.user.email,
          nombre: result.user.nombre,
          apellido: result.user.apellido,
          facultad: result.user.school?.nombre,
          role: result.user.role.nombre
        },
        token: result.token
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      res.status(200).json({
        user: req.user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const data = req.body;
      const result = await authService.changePassword(req.user.userId, data);

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
