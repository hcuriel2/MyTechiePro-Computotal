import mongoose, { Schema } from 'mongoose';
import Transaction from './transaction.interface';

const transactionSchema = new Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    paymentIntentId: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed']
    }
}, { timestamps: true });

const transactionModel = mongoose.model<Transaction & mongoose.Document>('Transaction', transactionSchema);
export default transactionModel;