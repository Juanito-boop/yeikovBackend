import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entidad: string; // Plan, Usuario, Facultad, Evidencia, etc.

  @Column()
  entidadId: string;

  @Column()
  accion: string; // CREATE, UPDATE, DELETE, ASIGNAR, APROBAR, RECHAZAR, etc.

  @Column('text')
  descripcion: string; // Descripción legible de la acción

  @Column({ nullable: true })
  entidadAfectada: string; // Nombre del usuario/plan/facultad afectado

  @Column('jsonb', { nullable: true })
  datosPrevios: any;

  @Column('jsonb', { nullable: true })
  datosNuevos: any;

  @Column({ nullable: true })
  ipAddress: string; // IP desde donde se realizó la acción

  @Column({ nullable: true })
  userAgent: string; // Navegador/dispositivo usado

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn()
  createdAt: Date;
}
