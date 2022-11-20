import { Type } from 'class-transformer';
import { Service } from './service';

export class Category {
    _id: string;
    name: string;
    icon: string;

    @Type(() => Service)
    services: Service[];
}
