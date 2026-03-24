"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAccount = void 0;
const typeorm_1 = require("typeorm");
const Creator_1 = require("./Creator");
let PlatformAccount = class PlatformAccount {
};
exports.PlatformAccount = PlatformAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlatformAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlatformAccount.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlatformAccount.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlatformAccount.prototype, "platformId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Creator_1.Creator, (creator) => creator.platformAccounts),
    __metadata("design:type", Creator_1.Creator)
], PlatformAccount.prototype, "creator", void 0);
exports.PlatformAccount = PlatformAccount = __decorate([
    (0, typeorm_1.Entity)()
], PlatformAccount);
