import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PlaylistVideo {
    @PrimaryGeneratedColumn()
    id!: number
    
    @Column()
    videoId!: string;

    @Column()
    title!: string;

    @Column()
    embedUrl!: string;

    @ManyToOne(() => User, user => user.playlist, { onDelete: "CASCADE" })
    user!: User;
}