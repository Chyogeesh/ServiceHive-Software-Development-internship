import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum EventStatus {
  BUSY = 'BUSY',
  SWAPPABLE = 'SWAPPABLE',
  SWAP_PENDING = 'SWAP_PENDING'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.BUSY
  })
  status: EventStatus;

  @ManyToOne(() => User, user => user.events)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
