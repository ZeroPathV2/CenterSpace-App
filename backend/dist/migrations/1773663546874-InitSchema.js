"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1773663546874 = void 0;
class InitSchema1773663546874 {
    constructor() {
        this.name = 'InitSchema1773663546874';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."o_auth_token_provider_enum" AS ENUM('twitch', 'youtube', 'reddit', 'spotify')`);
        await queryRunner.query(`CREATE TABLE "o_auth_token" ("id" SERIAL NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying, "expiresAt" TIMESTAMP, "provider" "public"."o_auth_token_provider_enum" NOT NULL, "userId" integer, CONSTRAINT "PK_f627e7380e58f41d1157094c0d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist_item" ("id" SERIAL NOT NULL, "platform" character varying NOT NULL, "playlistItemId" character varying NOT NULL, "channel" character varying, "embedUrl" character varying NOT NULL, "position" integer NOT NULL DEFAULT '0', "userId" integer, CONSTRAINT "PK_958bd2e5a3e9728df21b5855dc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "platform_account" ("id" SERIAL NOT NULL, "platform" character varying NOT NULL, "channel" character varying NOT NULL, "platformId" character varying, "creatorId" integer, CONSTRAINT "PK_2afc887b1d8a7f7895da99c4a38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "creator" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_43e489c9896f9eb32f7a0b912c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favourite" ("id" SERIAL NOT NULL, "userId" integer, "creatorId" integer, CONSTRAINT "PK_56f1996fc2983d1895e4a8f3af3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD CONSTRAINT "FK_cacccc1796e11c9350fc1544328" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_item" ADD CONSTRAINT "FK_09f764f36697f296cb94190e318" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "platform_account" ADD CONSTRAINT "FK_33198e8b0bb07f03f31ba1e4733" FOREIGN KEY ("creatorId") REFERENCES "creator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_55262b1e0fdf72d3443562a9c3d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite" ADD CONSTRAINT "FK_1c1eab84a457c694733c96d26f4" FOREIGN KEY ("creatorId") REFERENCES "creator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_1c1eab84a457c694733c96d26f4"`);
        await queryRunner.query(`ALTER TABLE "favourite" DROP CONSTRAINT "FK_55262b1e0fdf72d3443562a9c3d"`);
        await queryRunner.query(`ALTER TABLE "platform_account" DROP CONSTRAINT "FK_33198e8b0bb07f03f31ba1e4733"`);
        await queryRunner.query(`ALTER TABLE "playlist_item" DROP CONSTRAINT "FK_09f764f36697f296cb94190e318"`);
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP CONSTRAINT "FK_cacccc1796e11c9350fc1544328"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "favourite"`);
        await queryRunner.query(`DROP TABLE "creator"`);
        await queryRunner.query(`DROP TABLE "platform_account"`);
        await queryRunner.query(`DROP TABLE "playlist_item"`);
        await queryRunner.query(`DROP TABLE "o_auth_token"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_token_provider_enum"`);
    }
}
exports.InitSchema1773663546874 = InitSchema1773663546874;
