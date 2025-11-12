import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { PlanAccion } from "./PlanAccion";
import { User } from "./User";

@Entity('evidencias')
export class Evidencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlanAccion, accion => accion.evidencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accion_id' })
  accion: PlanAccion;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  comentario: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
