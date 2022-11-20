"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
class CreateUserDto {
}
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "email", void 0);
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "password", void 0);
__decorate([
    class_validator_1.IsString()
], CreateUserDto.prototype, "userType", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "proStatus", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "company", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "alias", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "rating", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "unitPrice", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "unitType", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "bio", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "website", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "inquiry", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "ratingSum", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "ratingCount", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "lat", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "lng", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "placeid", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.ValidateNested()
], CreateUserDto.prototype, "address", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "secret", void 0);
__decorate([
    class_validator_1.IsOptional()
], CreateUserDto.prototype, "tempsecret", void 0);
exports.default = CreateUserDto;
//# sourceMappingURL=user.dto.js.map