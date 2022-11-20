"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class surveyContentsDto {
}
class categoryDto {
}
__decorate([
    class_validator_1.IsString()
], categoryDto.prototype, "name", void 0);
__decorate([
    class_validator_1.IsObject(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => surveyContentsDto)
], categoryDto.prototype, "surveyContents", void 0);
class CreateSurveyDto {
}
__decorate([
    class_validator_1.IsObject(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => categoryDto)
], CreateSurveyDto.prototype, "category", void 0);
exports.default = CreateSurveyDto;
//# sourceMappingURL=survey.dto.js.map