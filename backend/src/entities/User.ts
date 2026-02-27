import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { OAuthToken } from "./OAuthToken";

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
}