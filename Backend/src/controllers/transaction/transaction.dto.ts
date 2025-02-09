
class CreateTransactionDto {
  _id: string;
  projectId: string;
  project: object      
  clientId: string;
  client: object;         
  professionalId: string;
  professional: object;   
  paymentIntentId: string;
  totalAmount: number;
  platformFee: number;
  status: string;
  createdAt: Date;
}

export default CreateTransactionDto;