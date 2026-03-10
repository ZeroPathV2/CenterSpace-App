"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1773081490352 = void 0;
class InitSchema1773081490352 {
    constructor() {
        this.name = 'InitSchema1773081490352';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."o_auth_token_provider_enum" AS ENUM('twitch', 'youtube', 'reddit', 'spotify')`);
        await queryRunner.query(`CREATE TABLE "o_auth_token" ("id" SERIAL NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying, "expiresAt" TIMESTAMP, "provider" "public"."o_auth_token_provider_enum" NOT NULL, "userId" integer, CONSTRAINT "PK_f627e7380e58f41d1157094c0d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist_item" ("id" SERIAL NOT NULL, "platform" character varying NOT NULL, "playlistItemId" character varying NOT NULL, "title" character varying NOT NULL, "embedUrl" character varying NOT NULL, "position" integer NOT NULL DEFAULT '0', "userId" integer, CONSTRAINT "PK_958bd2e5a3e9728df21b5855dc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "creator" ("id" SERIAL NOT NULL, "platform" character varying NOT NULL, "playlistItemId" character varying NOT NULL, "name" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_43e489c9896f9eb32f7a0b912c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD CONSTRAINT "FK_cacccc1796e11c9350fc1544328" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_item" ADD CONSTRAINT "FK_09f764f36697f296cb94190e318" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "creator" ADD CONSTRAINT "FK_353c6a2a42076706980ba744c49" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "creator" DROP CONSTRAINT "FK_353c6a2a42076706980ba744c49"`);
        await queryRunner.query(`ALTER TABLE "playlist_item" DROP CONSTRAINT "FK_09f764f36697f296cb94190e318"`);
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP CONSTRAINT "FK_cacccc1796e11c9350fc1544328"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "creator"`);
        await queryRunner.query(`DROP TABLE "playlist_item"`);
        await queryRunner.query(`DROP TABLE "o_auth_token"`);
        await queryRunner.query(`DROP TYPE "public"."o_auth_token_provider_enum"`);
    }
}
exports.InitSchema1773081490352 = InitSchema1773081490352;
