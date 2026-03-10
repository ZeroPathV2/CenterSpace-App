import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { OAuthProvider } from "./OAuthProvider";

@Entity()
export class OAuthToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accessToken!: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date;

  @Column({ type: "enum", enum: OAuthProvider })
  provider!: OAuthProvider;

  @ManyToOne(() => User, (user) => user.tokens)
  user!: User;
}