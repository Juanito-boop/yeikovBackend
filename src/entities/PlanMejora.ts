import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Incidencia } from "./incidencias";
import { User } from "./User";
import { PlanAccion } from "./PlanAccion";
import { Aprobacion } from "./Aprobacion";

@Entity('planes_mejora')
export class PlanMejora {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column({ default: 'PendienteDecano' })
  estado: string; // PendienteDecano, AprobadoDecano, RechazadoDecano, Activo, EnEjecucion, Cerrado

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creado_por' })
  creadoPor: User; // Director que creó el plan

  @ManyToOne(() => User, user => user.plans)
  @JoinColumn({ name: 'docente_id' })
  docente: User;

  @ManyToOne(() => Incidencia, { nullable: true })
  @JoinColumn({ name: 'incidencia_id' })
  incidencia: Incidencia | null;

  @OneToMany(() => PlanAccion, accion => accion.plan)
  acciones: PlanAccion[];

  @OneToMany(() => Aprobacion, a => a.plan)
  aprobaciones: Aprobacion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
