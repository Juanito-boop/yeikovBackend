import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.loginHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'login_time' })
  loginTime: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ default: true })
  exitoso: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
