import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export class DefaultBaseEntity {
  /** @1 */ @CreateDateColumn({ name: 'created_at' }) createdAt: Date
  /** @2 */ @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date
}