import { User } from './user';

export class ProjectWithUserNames {
    state: string | undefined; // Requested, Accepted, Completed, Declined
    _id: string

    serviceName: string | undefined;
    serviceId: string | undefined;
    rating: number | undefined;

    createdAt: Date | undefined;
    updatedAt: Date | undefined;

    // id of professional
    professional: User;
    // name of professional
    professionalName: string | undefined;
    // id of client
    client: User;
    // name of client
    clientName: string | undefined;

    comments: Message[] = [];
}

export class Message {
    senderID: number | undefined;
    message: string | undefined;
}
