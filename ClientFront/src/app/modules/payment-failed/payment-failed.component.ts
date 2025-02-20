import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  template: `
    <div class="redirect-container">
      <div class="redirect-content">
        <h2>Payment Failed</h2>
        <p>Redirecting back to projects...</p>
        <div class="loader"></div>
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
      border-top: 3px solid #ff4444;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class PaymentFailedComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // 立即重定向到 projects 页面
    this.router.navigate(['/projects']).then(() => {
      console.log('Payment failed, redirected to projects page');
    });
  }
}
