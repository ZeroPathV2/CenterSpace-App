import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OAuthToken } from "./OAuthToken";
import { PlaylistItem } from "./PlaylistItem";
import { Favourite } from "./Favourite";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => OAuthToken, (token) => token.user)
  tokens!: OAuthToken[];

  @OneToMany(() => PlaylistItem, (item) => item.user)
  playlist!: PlaylistItem[];

  @OneToMany(() => Favourite, (fav) => fav.user)
  favourites!: Favourite[];

}