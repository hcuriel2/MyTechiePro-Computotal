interface Transaction {
  _id: string;
  project: object;
  client: object;
  professional: object;
  paymentIntentId: string;
  totalAmount: number;
  platformFee: number;
  platformFeeRate?: number;
  status: string;
  createdAt: Date;
}

export default Transaction;