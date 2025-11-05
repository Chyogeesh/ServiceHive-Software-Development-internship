import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Event } from './Event';

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

@Entity('swap_requests')
export class SwapRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { cascade: true })
  @JoinColumn({ name: 'offerSlotId' })
  offerSlot: Event;

  @Column()
  offerSlotId: string;

  @ManyToOne(() => Event, { cascade: true })
  @JoinColumn({ name: 'requestSlotId' })
  requestSlot: Event;

  @Column()
  requestSlotId: string;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column()
  requesterId: string;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  recipientId: string;

  @Column({
    type: 'enum',
    enum: SwapStatus,
    default: SwapStatus.PENDING
  })
  status: SwapStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
