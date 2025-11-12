import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity('incidencias')
export class Incidencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  descripcion: string;

  @ManyToOne(() => User, user => user.incidencias)
  @JoinColumn({ name: 'docente_id' })
  docente: User;

  @Column({ default: 'Pendiente' })
  estado: string; // Pendiente, Revisado, Archivado

  @CreateDateColumn()
  createdAt: Date;
}
