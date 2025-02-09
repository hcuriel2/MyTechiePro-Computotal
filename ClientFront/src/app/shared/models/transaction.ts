import { Project } from "./project";
import { User } from "./user";

export class Transaction {
  _id: string;
  projectId: string;
  project: Project;
  clientId: string;
  client: User;
  professionalId: string;
  professional: User;
  paymentIntentId: string;
  totalAmount: number;
  platformFee: number;
  status: string;
  createdAt: Date;
}