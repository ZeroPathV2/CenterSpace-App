import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PlaylistItem {

  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  platform!: string

  @Column()
  playlistItemId!: string

  @Column()
  title!: string

  @Column()
  embedUrl!: string

  @Column({ type: "int", default: 0 })
  position!: number

  @ManyToOne(() => User, (user) => user.playlist, { onDelete: "CASCADE" })
  user!: User
}