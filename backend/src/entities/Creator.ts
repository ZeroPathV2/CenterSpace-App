import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Creator {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  platform!: string

  @Column()
  playlistItemId!: string

  @Column()
  name!: string

  @ManyToOne(() => User, user => user.creators, { onDelete: "CASCADE" })
  user!: User
}