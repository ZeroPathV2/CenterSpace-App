"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
// import { User } from "./entities/User";
// import { OAuthToken } from "./entities/OAuthToken";
// import { PlaylistItem } from "./entities/PlaylistItem";
// import { Creator } from "./entities/Creator";
exports.AppDataSource = new typeorm_1.DataSource({
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
