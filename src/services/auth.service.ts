import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { LoginHistory } from '../entities/LoginHistory';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/Notification';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private loginHistoryRepository = AppDataSource.getRepository(LoginHistory);
  private notificationService = new NotificationService();

  async register(data: RegisterInput): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido,
      roleId: data.roleId,
      schoolId: data.schoolId,
      activo: true
    });

    await this.userRepository.save(user);

    const token = this.generateToken(user);

    return { user, token };
  }

  async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: ['role', 'school']
    });

    if (!user) {
      await this.recordLoginAttempt(null, ipAddress, userAgent, false);
      throw new Error('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new Error('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      await this.recordLoginAttempt(user.id, ipAddress, userAgent, false);
      throw new Error('Credenciales inválidas');
    }

    await this.recordLoginAttempt(user.id, ipAddress, userAgent, true);

    await this.notificationService.create({
      userId: user.id,
      tipo: NotificationType.LOGIN,
      mensaje: `Inicio de sesión exitoso desde IP: ${ipAddress || 'desconocida'}`,
      asunto: 'Nuevo inicio de sesión',
      enviarEmail: true
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  private async recordLoginAttempt(
    userId: string | null,
    ipAddress?: string,
    userAgent?: string,
    exitoso: boolean = true
  ): Promise<void> {
    if (!userId) return;

    const loginHistory = this.loginHistoryRepository.create({
      userId,
      loginTime: new Date(),
      ipAddress,
      userAgent,
      exitoso
    });

    await this.loginHistoryRepository.save(loginHistory);
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        facultad: user.school,
        roleId: user.roleId
      },
      secret,
      { expiresIn: '24h' }
    );
  }

  async verifyToken(token: string): Promise<any> {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}
