import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { LoginHistory } from './LoginHistory';
import { Notification } from './Notification';
import { School } from './School';
import { Plan } from './Plan';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  apellido: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Plan, plan => plan.user)
  plans: Plan[];

  @Column({ name: 'school_id', nullable: true })
  schoolId: string | null;

  @ManyToOne(() => School, school => school.users, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school: School | null;

  @OneToMany(() => LoginHistory, loginHistory => loginHistory.user)
  loginHistory: LoginHistory[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
