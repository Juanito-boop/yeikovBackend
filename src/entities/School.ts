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

  @Column({ type: 'varchar', nullable: true })
  decano: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'email_decano' })
  emailDecano: string | null;

  @Column({ type: 'simple-json', nullable: true })
  departamentos: string[] | null;

  @OneToMany(() => User, user => user.school)
  users: User[];
}