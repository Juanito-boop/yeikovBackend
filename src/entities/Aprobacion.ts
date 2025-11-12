import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";
import { PlanMejora } from "./PlanMejora";
import { User } from "./User";

@Entity('aprobaciones')
export class Aprobacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlanMejora, plan => plan.aprobaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanMejora;

  @Column()
  nivel: string; // Decano, Dirección, etc.

  @Column({ default: false })
  aprobado: boolean;

  @Column({ nullable: true })
  comentarios: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'aprobado_por' })
  aprobadoPor: User;

  @CreateDateColumn()
  fecha: Date;
}
