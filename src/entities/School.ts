import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';

@Entity('school')
export class School {

  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  nombre: string;
  
  @Column()
  direccion: string;

  @OneToMany(() => User, user => user.school)
  users: User[];
}