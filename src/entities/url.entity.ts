import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  // BIGSERIAL under the hood — Postgres owns this sequence, generates it
  // atomically on INSERT. This is the number you'll base62-encode into
  // shortCode right after the insert succeeds.
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string; // TypeORM returns bigint as string in JS to avoid precision loss

  // Indexed + unique because every redirect does `WHERE shortCode = ?`.
  // Without this index that lookup is a full table scan once you have
  // more than a few thousand rows.
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  shortCode!: string;

  @Column({ type: 'text' })
  originalUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
