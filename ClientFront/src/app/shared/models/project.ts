import { Message } from './message';
import { User } from './user';

export class Project {
    _id: string;
    state: string; // Requested, Accepted, Completed, Declined
    serviceId: string;
    serviceName: string;
    professional: User;
    client: User;
    comments: Message[] = [];
    projectDetails: string;
    totalCost: number;
    eTransferEmail: string;
    rating: number;
    feedback: string;

    projectStartDate: Date;
    projectEndDate: Date;
    createdAt: Date;
    updatedAt: Date;


    // used for dto reasons
    professionalId: string;
    clientId: string;
    userId: string;
}
