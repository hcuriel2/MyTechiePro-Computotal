import { User } from './user';

export class Project {
    state: string | undefined; // Requested, Accepted, Completed, Declined
    _id: string

    serviceName: string | undefined;
    serviceId: string | undefined;
    rating: number | undefined;

    createdAt: Date | undefined;
    updatedAt: Date | undefined;

    professional: User | undefined;
    client: User | undefined;

    comments: Message[] = [];
}

export class Message {
    senderID: number | undefined;
    message: string | undefined;
}
