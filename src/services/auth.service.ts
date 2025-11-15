import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { LoginHistory } from '../entities/LoginHistory';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput, ChangePasswordInput } from '../schemas/auth.schema';
import { NotificationService } from './notification.service';
import { NotificationType } from '../entities/Notification';
import { createEmailTransporter, emailConfig } from '../config/email.config';
import { AuditService } from './audit.service';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private loginHistoryRepository = AppDataSource.getRepository(LoginHistory);
  private notificationService = new NotificationService();
  private auditService = new AuditService();

  async register(data: RegisterInput, sendWelcomeEmail: boolean = false, creadorId?: string): Promise<{ user: User; token: string }> {
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

    // Registrar en auditoría si hay un creador
    if (creadorId) {
      const userWithRole = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['role']
      });
      await this.auditService.registrarCreacionUsuario(
        user.id,
        `${user.nombre} ${user.apellido}`,
        userWithRole?.role?.nombre || 'N/A',
        creadorId
      );
    }

    // Enviar email de bienvenida con contraseña temporal
    if (sendWelcomeEmail) {
      await this.sendWelcomeEmail(user, data.password);
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  private async sendWelcomeEmail(user: User, temporalPassword: string): Promise<void> {
    try {
      const transporter = createEmailTransporter();

      const mailOptions = {
        from: emailConfig.from,
        to: user.email,
        subject: 'Bienvenido al Sistema de Gestión de Planes de Mejoramiento - SGPM',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e40af; margin: 0;">¡Bienvenido al SGPM!</h1>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Estimado/a <strong>${user.nombre} ${user.apellido}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Tu cuenta ha sido creada exitosamente en el Sistema de Gestión de Planes de Mejoramiento (SGPM).
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid #1e40af; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <h3 style="color: #1e40af; margin-top: 0;">Credenciales de Acceso</h3>
                <p style="color: #374151; margin: 10px 0;">
                  <strong>Usuario (Email):</strong> ${user.email}
                </p>
                <p style="color: #374151; margin: 10px 0;">
                  <strong>Contraseña Temporal:</strong> <code style="background-color: #dbeafe; padding: 5px 10px; border-radius: 3px; font-size: 14px;">${temporalPassword}</code>
                </p>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 5px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar esta contraseña temporal en tu primer inicio de sesión.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:4321'}" 
                   style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Acceder al Sistema
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar al administrador del sistema.
              </p>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email de bienvenida enviado a: ${user.email}`);
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      // No lanzamos error para no bloquear el registro
    }
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

    // Registrar en auditoría
    await this.auditService.registrarLogin(
      user.id,
      `${user.nombre} ${user.apellido}`,
      ipAddress,
      userAgent
    );

    // No enviar email en cada login

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

  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Verificar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    // Notificar al usuario
    await this.notificationService.create({
      userId: user.id,
      tipo: NotificationType.GENERAL,
      mensaje: 'Tu contraseña ha sido cambiada exitosamente',
      asunto: 'Contraseña actualizada',
      enviarEmail: true
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async updateUser(
    userId: string,
    data: {
      nombre?: string;
      apellido?: string;
      email?: string;
      roleId?: string;
      schoolId?: string;
    },
    actualizadorId?: string
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'school']
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si se está cambiando el email, verificar que no esté en uso
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
    }

    // Construir descripción de cambios para auditoría
    const cambios: string[] = [];
    if (data.nombre !== undefined && data.nombre !== user.nombre) cambios.push('nombre');
    if (data.apellido !== undefined && data.apellido !== user.apellido) cambios.push('apellido');
    if (data.email !== undefined && data.email !== user.email) cambios.push('email');
    if (data.roleId !== undefined && data.roleId !== user.roleId) cambios.push('rol');
    if (data.schoolId !== undefined && data.schoolId !== user.schoolId) cambios.push('facultad');

    // Actualizar campos
    if (data.nombre !== undefined) user.nombre = data.nombre;
    if (data.apellido !== undefined) user.apellido = data.apellido;
    if (data.email !== undefined) user.email = data.email;
    if (data.roleId !== undefined) user.roleId = data.roleId;
    if (data.schoolId !== undefined) user.schoolId = data.schoolId;

    await this.userRepository.save(user);

    // Registrar en auditoría
    if (actualizadorId && cambios.length > 0) {
      await this.auditService.registrarActualizacionUsuario(
        user.id,
        `${user.nombre} ${user.apellido}`,
        cambios.join(', '),
        actualizadorId
      );
    }

    // Recargar el usuario con relaciones
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'school']
    });

    return updatedUser!;
  }

  async deactivateUser(userId: string, desactivadorId?: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.activo = false;
    await this.userRepository.save(user);

    // Registrar en auditoría
    if (desactivadorId) {
      await this.auditService.registrarDesactivacionUsuario(
        user.id,
        `${user.nombre} ${user.apellido}`,
        desactivadorId
      );
    }

    // Notificar al usuario
    await this.notificationService.create({
      userId: user.id,
      tipo: NotificationType.GENERAL,
      mensaje: 'Tu cuenta ha sido desactivada',
      asunto: 'Cuenta desactivada',
      enviarEmail: true
    });

    return { message: 'Usuario desactivado exitosamente' };
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.activo = true;
    await this.userRepository.save(user);

    return { message: 'Usuario activado exitosamente' };
  }
}
