import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './User';

export enum RoleType {
  DOCENTE = 'Docente',
  ADMIN = 'Admin',
  DECANO = 'Decano',
  DIRECTOR = 'Director'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 50 })
  nombre: RoleType;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
