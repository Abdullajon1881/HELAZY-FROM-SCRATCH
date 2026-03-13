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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const doctors_service_1 = require("./doctors.service");
const guards_1 = require("../../common/guards");
let DoctorsController = class DoctorsController {
    constructor(doctors) {
        this.doctors = doctors;
    }
    findAll(query) {
        return this.doctors.findAll(query);
    }
    getMyProfile(user) {
        return this.doctors.getMyProfile(user.id);
    }
    updateMyProfile(user, body) {
        return this.doctors.updateMyProfile(user.id, body);
    }
    setAvailability(user, isAvailable) {
        return this.doctors.setAvailability(user.id, isAvailable);
    }
    getMySchedule(user) {
        return this.doctors.getSchedule(user.id);
    }
    updateSchedule(user, schedule) {
        return this.doctors.updateSchedule(user.id, schedule);
    }
    apply(user, body) {
        return this.doctors.applyAsDoctor(user.id, body);
    }
    findOne(id) {
        return this.doctors.findOne(id);
    }
    getSchedule(id) {
        return this.doctors.getSchedule(id);
    }
    getSlots(id, date) {
        return this.doctors.getAvailableSlots(id, date);
    }
    getReviews(id, page = 1, limit = 10) {
        return this.doctors.getReviews(id, +page, +limit);
    }
};
exports.DoctorsController = DoctorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all approved doctors with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Patch)('me/availability'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('isAvailable')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "setAvailability", null);
__decorate([
    (0, common_1.Get)('me/schedule'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getMySchedule", null);
__decorate([
    (0, common_1.Put)('me/schedule'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('schedule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, guards_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)(':id/slots'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getSlots", null);
__decorate([
    (0, common_1.Get)(':id/reviews'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "getReviews", null);
exports.DoctorsController = DoctorsController = __decorate([
    (0, swagger_1.ApiTags)('Doctors'),
    (0, common_1.Controller)('doctors'),
    __metadata("design:paramtypes", [doctors_service_1.DoctorsService])
], DoctorsController);
//# sourceMappingURL=doctors.controller.js.map