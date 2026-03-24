import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

import { User } from "./User";
import { Creator } from "./Creator";

@Entity()
export class Favourite {

  @PrimaryGeneratedColumn()
  id!: number;
  
  @ManyToOne(() => User, (user) => user.favourites)
  user!: User;
  
  @ManyToOne(() => Creator, (creator) => creator.favourites)
  creator!: Creator;

}