import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;
  
  @Column()
  descripcion: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.plans)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
