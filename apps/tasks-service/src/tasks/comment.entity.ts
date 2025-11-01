import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from './task.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relation: Who wrote the comment?
  @ManyToOne(() => User, { eager: true, nullable: false })
  author: User;

  @Column()
  authorId: string;
  
  // Relation: Which task does this comment belong to?
  @ManyToOne(() => Task, (task) => task.id, { nullable: false, onDelete: 'CASCADE' })
  task: Task;

  @Column()
  taskId: string;
}