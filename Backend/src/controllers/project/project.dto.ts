import { IsOptional, IsNumber, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";

class CreateProjectDto {
    public categoryId:string;
    public serviceId: string;
    public serviceName: string;
    public professionalId: string;
    public _id: string;
    @IsNumber()
    public rating: number;
    public feedback: string;
    public state: string;
    public client: object;
    public professional: object;
    public comments: Array<{text: string, authorId:string, authorName:string}>;
    public totalCost: number;
    public clientId: string;
}

export default CreateProjectDto;
