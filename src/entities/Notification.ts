import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum NotificationType {
  LOGIN = 'login',
  PLAN_ASIGNADO = 'plan_asignado',
  PLAN_PENDIENTE = 'plan_pendiente',
  PLAN_ACTIVO = 'plan_activo',
  PLAN_RECHAZADO = 'plan_rechazado',
  EVIDENCIA_SUBIDA = 'evidencia_subida',
  COMENTARIO = 'comentario',
  GENERAL = 'general'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  tipo: NotificationType;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ nullable: true })
  asunto: string;

  @Column({ default: false })
  leida: boolean;

  @Column({ name: 'enviado_email', default: false })
  enviadoEmail: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
