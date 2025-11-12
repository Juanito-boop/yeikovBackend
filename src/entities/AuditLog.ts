import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entidad: string;

  @Column()
  entidadId: string;

  @Column()
  accion: string; // CREATE, UPDATE, DELETE

  @Column('jsonb', { nullable: true })
  datosPrevios: any;

  @Column('jsonb', { nullable: true })
  datosNuevos: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn()
  createdAt: Date;
}
