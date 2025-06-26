import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Broadcast } from './broadcast.entity';

@Entity('broadcast_analytics_timeseries')
@Index(['broadcastId', 'timestampBucket'])
export class BroadcastAnalyticsTimeseries {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'broadcast_id' })
  broadcastId: string;

  @Column({ name: 'timestamp_bucket', type: 'timestamp' })
  timestampBucket: Date;

  @Column({ name: 'sent_increment', default: 0 })
  sentIncrement: number;

  @Column({ name: 'open_increment', default: 0 })
  openIncrement: number;

  @Column({ name: 'click_increment', default: 0 })
  clickIncrement: number;

  @ManyToOne(() => Broadcast, (broadcast) => broadcast.analyticsTimeseries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'broadcast_id' })
  broadcast: Broadcast;
}
