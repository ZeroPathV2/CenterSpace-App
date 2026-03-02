import "reflect-metadata";
import { DataSource } from "typeorm";
// import { User } from "./entities/User";
// import { OAuthToken } from "./entities/OAuthToken";
// import { PlaylistItem } from "./entities/PlaylistItem";
// import { Creator } from "./entities/Creator";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // auto-create tables (dev only)
  logging: false,
  entities: [__dirname + "/entities/*.{ts,js}"],
});