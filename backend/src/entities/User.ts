import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { OAuthToken } from "./OAuthToken";
import { PlaylistItem } from "./PlaylistItem";
import { Creator } from "./Creator";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string

  @OneToMany(() => OAuthToken, (token) => token.user)
  tokens!: OAuthToken[];

  @OneToMany(() => PlaylistItem, item => item.user)
  playlist!: PlaylistItem[]

  @OneToMany(() => Creator, creator => creator.user)
  creators!: Creator[];
}