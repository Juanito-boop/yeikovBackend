import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { PlanMejora } from "./PlanMejora";
import { Evidencia } from "./Evidencia";

@Entity('plan_acciones')
export class PlanAccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  descripcion: string;

  @Column({ default: 'Pendiente' })
  estado: string; // Pendiente, EnProgreso, Completada

  @ManyToOne(() => PlanMejora, plan => plan.acciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlanMejora;

  @OneToMany(() => Evidencia, ev => ev.accion)
  evidencias: Evidencia[];

  @Column({ type: 'date', nullable: true })
  fechaObjetivo: Date;
}
