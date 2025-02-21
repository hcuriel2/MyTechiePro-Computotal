import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/shared/services/transaction.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  error = false;
  statusMessage = 'Verifying Payment...';
  detailMessage = 'Please wait while we confirm your payment.';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const { session_id, transactionId, projectId } = this.route.snapshot.queryParams;
    
    if (!session_id || !transactionId || !projectId) {
      this.handleError('Invalid payment session');
      return;
    }

    this.checkPaymentStatus(session_id, transactionId, projectId);
  }

  private checkPaymentStatus(sessionId: string, transactionId: string, projectId: string): void {
    this.loading = true;
    this.error = false;
    
    console.log('Checking payment status with:', { sessionId, transactionId, projectId });

    this.transactionService.checkPaymentStatus(sessionId, transactionId, projectId)
      .subscribe(
        (response: any) => {
          console.log('Payment status response:', response);
          if (response.status === 'completed') {
            this.statusMessage = 'Payment Successful!';
            this.detailMessage = 'Redirecting to your projects...';
            setTimeout(() => {
              this.router.navigate(['/projects']);
            }, 2000);
          } else if (response.status === 'pending') {
            this.statusMessage = 'Payment Processing';
            this.detailMessage = 'Your payment is still being processed...';
            // Retry after 5 seconds
            setTimeout(() => {
              this.checkPaymentStatus(sessionId, transactionId, projectId);
            }, 5000);
          } else {
            this.handleError('Payment verification failed');
          }
        },
        (error) => {
          console.error('Detailed payment verification error:', {
            error,
            status: error.status,
            message: error.message,
            details: error.error
          });
          this.handleError(`Error verifying payment: ${error.error?.message || error.message}`);
        }
      );
  }

  private handleError(message: string): void {
    this.loading = false;
    this.error = true;
    this.statusMessage = 'Oops! Something went wrong';
    this.detailMessage = message;
  }

  retryPaymentCheck(): void {
    const { session_id, transactionId, projectId } = this.route.snapshot.queryParams;
    this.checkPaymentStatus(session_id, transactionId, projectId);
  }
}