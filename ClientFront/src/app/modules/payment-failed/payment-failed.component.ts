import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from 'src/app/shared/services/transaction.service';

@Component({
  selector: 'app-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.scss']
})
export class PaymentFailedComponent implements OnInit {
  message: string = 'Your payment failed. Please try again or contact support.';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const { session_id, transactionId } = this.route.snapshot.queryParams;
    if (session_id && transactionId) {
      this.transactionService.checkPaymentStatus(session_id, transactionId)
        .subscribe(
          response => {
            console.log('Updated transaction on payment-failed:', response);
          },
          error => {
            console.error('Error updating transaction:', error);
          }
        );
    }

    setTimeout(() => {
      this.router.navigate(['/projects']).then(() => {
        console.log('Payment failed, redirected to projects page');
      });
    }, 3000);
  }
}
