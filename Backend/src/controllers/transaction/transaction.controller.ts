import { Request, Response, NextFunction } from 'express';
import Controller from '../../interfaces/controller.interface';
import { Router } from 'express';
import validationMiddleware from '../../middleware/validation.middleware';
import HttpException from '../../exceptions/HttpException';
import TransactionModel from '../../models/transaction/transaction.model';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import ProjectModel from '../../models/project/project.model';


class TransactionController implements Controller {
    public path = '/transactions';
    public router = Router();
    private transaction = TransactionModel;
    private project = ProjectModel;
    private stripe: Stripe;

    constructor() {
        this.initializeRoutes();
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-01-27.acacia",
        });
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/status`, this.checkPaymentStatus);
        this.router.get(`${this.path}/project/:projectId`, this.getTransactionByProjectId);
        this.router.get(`${this.path}/:id`, this.getTransactionById);
    }

    private getTransactionById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const transaction = await this.transaction
                .findById(req.params.id);
            if (!transaction) {
                next(new HttpException(404, 'Transaction not found'));
            }
            res.send(transaction);
        } catch (error) {
            next(new HttpException(400, 'Invalid transaction id'));
        }
    };

    private getTransactionByProjectId = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const transaction = await this.transaction
                .findOne({ project: new Types.ObjectId(req.params.projectId) });
            if (!transaction) {
                next(new HttpException(404, 'Transaction not found'));
            }
            res.send(transaction);
        } catch (error) {
            next(new HttpException(400, 'Invalid project id'));
        }
    };
    
    // Niko: This function checks the Stripe payment status using the session_id provided in the query.
    // It extracts session_id, transactionId, and projectId from the request query parameters.
    // If the payment is successful ('paid'), it updates the corresponding Transaction status to 'completed' and sets the Project state to "Paid".
    // If the payment is 'unpaid', it updates the Transaction status to 'failed'.
    // Otherwise, it returns the current Stripe payment status, in this case is pending.
    private checkPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = Array.isArray(req.query.session_id)
            ? req.query.session_id[0]
            : req.query.session_id;
        const rawTxnId = Array.isArray(req.query.transactionId)
            ? req.query.transactionId[0]
            : req.query.transactionId;
        const txnId = rawTxnId ? decodeURIComponent(rawTxnId.toString()).trim() : '';
    
        const projectId = Array.isArray(req.query.projectId)
            ? req.query.projectId[0]
            : req.query.projectId;
    
        if (!sessionId || !txnId || !projectId) {
            return res.status(400).json({ error: "Missing session_id, transactionId or projectId" });
        }
    
        if (!Types.ObjectId.isValid(txnId.toString()) || !Types.ObjectId.isValid(projectId.toString())) {
            return res.status(400).json({ error: "Invalid transaction id or projectId format" });
        }
    
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId as string);
            if (session.payment_status === 'paid') {
                const updatedTransaction = await this.transaction.findByIdAndUpdate(
                    txnId,
                    {
                        status: 'completed',
                        paymentIntentId: session.payment_intent ? session.payment_intent.toString() : ''
                    },
                    { new: true }
                );
                if (!updatedTransaction) {
                    return res.status(404).json({ error: "Transaction not found" });
                }
                const updatedProject = await this.project.findByIdAndUpdate(
                    projectId,
                    { state: "Paid" },
                    { new: true }
                );
                if (!updatedProject) {
                    return res.status(404).json({ error: "Project not found" });
                }
                return res.json({ status: "completed", transaction: updatedTransaction, project: updatedProject });
            } else if (session.payment_status === 'unpaid') {
                const updatedTransaction = await this.transaction.findByIdAndUpdate(
                    txnId,
                    {
                        status: 'failed',
                        paymentIntentId: session.payment_intent ? session.payment_intent.toString() : ''
                    },
                    { new: true }
                );
                if (!updatedTransaction) {
                    return res.status(404).json({ error: "Transaction not found" });
                }
                return res.json({ status: "failed", transaction: updatedTransaction });
            } else {
                return res.json({ status: session.payment_status });
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            return next(new HttpException(500, "Failed to check payment status"));
        }
    };
}

export default TransactionController;