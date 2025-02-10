import { Project } from './project';
import { User } from './user';

export class Transaction {
    _id: string;
    paymentIntentId: string;
    totalAmount: number;
    platformFee: number;
    status: string;
    createdAt: Date;
    project: Project;
    client: User;
    professional: User;
}

