import { Router, Request, Response } from "express";
import Stripe from "stripe";
import Controller from "../../interfaces/controller.interface";
import userModel from "../../models/user/user.model";

/**
 * Controller for handling Stripe Connect integration
 * Manages professional service providers' payment accounts
 */
class StripeController implements Controller {
    public path = "/stripe";
    public router = Router();
    private stripe: Stripe;
    private user = userModel;

    constructor() {
        // Initialize Stripe with secret key and latest API version
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2025-01-27.acacia",
        });
        this.initializeRoutes();
    }

    /**
     * Initialize all routes related to Stripe integration
     */
    private initializeRoutes() {
        this.router.post(`${this.path}/connect-account`, this.createConnectAccount);
        this.router.get(`${this.path}/account-status/:accountId`, this.getAccountStatus);
        this.router.post(`${this.path}/update-stripe-id`, this.updateStripeAccountId);
    }

    /**
     * Creates a Stripe Connect Express account for a service provider
     * @param req Contains email and userId
     * @param res Returns accountLink URL for onboarding and accountId
     */
    private createConnectAccount = async (req: Request, res: Response) => {
        try {
            const { email, userId } = req.body;

            const account = await this.stripe.accounts.create({
                type: "express",
                email: email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
           
            // Generate onboarding link with success/failure redirects
            const accountLink = await this.stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${process.env.CLIENT_URL}/settings`,
                return_url: `${process.env.CLIENT_URL}/stripe-onboarding-success?userId=${userId}&accountId=${account.id}`,
                type: "account_onboarding",
            });

            res.json({
                accountLink: accountLink.url,
                accountId: account.id,
            });
        } catch (error: any) {
            console.error("Stripe account creation error:", error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Checks if a Stripe account has completed onboarding
     * @param req Contains accountId in params
     * @param res Returns completion status and accountId
     */
    private getAccountStatus = async (req: Request, res: Response) => {
        try {
            const { accountId } = req.params;
            const account = await this.stripe.accounts.retrieve(accountId);

            const isComplete = account.details_submitted && account.payouts_enabled;

            res.json({
                isComplete,
                accountId: account.id,
            });
        } catch (error: any) {
            console.error("Stripe account status check error:", error);
            res.status(500).json({ error: error.message });
        }
    };
    /**
     * Updates user's Stripe account ID after successful onboarding
     * @param req Contains userId and accountId
     * @param res Returns updated user object
     */
    private updateStripeAccountId = async (req: Request, res: Response) => {
        try {
            const { userId, accountId } = req.body;

            const account = await this.stripe.accounts.retrieve(accountId);
            const isComplete = account.details_submitted && account.payouts_enabled;

            if (!isComplete) {
                return res.status(400).json({
                    success: false,
                    message: "Onboarding not completed yet.",
                });
            }

            const updatedUser = await this.user.findByIdAndUpdate(
                userId, 
                { stripeAccountId: accountId }, 
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            res.json({ success: true, message: "Stripe account linked successfully.", user: updatedUser });
        } catch (error: any) {
            console.error("Error updating Stripe account ID:", error);
            res.status(500).json({ error: error.message });
        }
    };
}

export default StripeController;
