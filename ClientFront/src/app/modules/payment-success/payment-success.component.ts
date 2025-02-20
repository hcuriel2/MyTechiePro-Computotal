import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/shared/services/transaction.service';

@Component({
  selector: 'app-payment-success',
  template: `
    <div class="redirect-container">
      <div class="redirect-content">
        <h2>{{ statusMessage }}</h2>
        <p>{{ detailMessage }}</p>
        <div class="loader" *ngIf="loading"></div>
        <button *ngIf="error" (click)="retryPaymentCheck()" class="retry-btn">
          Retry
        </button>
      </div>
    </div>
  `,
  styles: [`
    .redirect-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .redirect-content {
      text-align: center;
      padding: 20px;
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-radius: 50%;
      border-top: 3px solid #3498db;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .retry-btn {
      padding: 10px 20px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }
    
    .retry-btn:hover {
      background-color: #2980b9;
    }
  `]
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
    const { session_id, transactionId } = this.route.snapshot.queryParams;
    
    if (!session_id || !transactionId) {
      this.handleError('Invalid payment session');
      return;
    }

    this.checkPaymentStatus(session_id, transactionId);
  }

  private checkPaymentStatus(sessionId: string, transactionId: string): void {
    this.loading = true;
    this.error = false;
    
    console.log('Checking payment status with:', { sessionId, transactionId });

    this.transactionService.checkPaymentStatus(sessionId, transactionId)
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
              this.checkPaymentStatus(sessionId, transactionId);
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
    const { session_id, transactionId } = this.route.snapshot.queryParams;
    this.checkPaymentStatus(session_id, transactionId);
  }
}
