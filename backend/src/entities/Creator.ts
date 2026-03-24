import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { PlatformAccount } from "./PlatformAccount";
import { Favourite } from "./Favourite";

@Entity()
export class Creator {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => PlatformAccount, (account) => account.creator)
  platformAccounts!: PlatformAccount[];

  @OneToMany(() => Favourite, (fav) => fav.creator)
  favourites!: Favourite[];

}