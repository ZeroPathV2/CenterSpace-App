import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Creator } from "./Creator";

@Entity()
export class PlatformAccount {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  platform!: string;

  @Column()
  channel!: string;

  @Column({ nullable: true })
  platformId!: string;

  @ManyToOne(() => Creator, (creator) => creator.platformAccounts)
  creator!: Creator;

}