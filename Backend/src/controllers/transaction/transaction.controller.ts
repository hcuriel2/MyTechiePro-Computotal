import { Request, Response, NextFunction } from 'express';
import Controller from '../../interfaces/controller.interface';
import { Router } from 'express';
import validationMiddleware from '../../middleware/validation.middleware';
import HttpException from '../../exceptions/HttpException';
import TransactionModel from '../../models/transaction/transaction.model';
import { Types } from 'mongoose';

class TransactionController implements Controller {
    public path = '/transactions';
    public router = Router();
    private transaction = TransactionModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/:id`,
            this.getTransactionById
        );
        this.router.get(
            `${this.path}/project/:projectId`,
            this.getTransactionByProjectId
        );
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
                .findOne({ project: req.params.projectId });
            if (!transaction) {
                next(new HttpException(404, 'Transaction not found'));
            }
            res.send(transaction);
        } catch (error) {
            next(new HttpException(400, 'Invalid project id'));
        }
    };
}

export default TransactionController;