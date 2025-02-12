import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-stripe-success',
  template: '', 
  styleUrls: []
})
export class StripeSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const accountId = params['accountId'];

      if (userId && accountId) {
        this.userService.setStripeAccountId(userId, accountId).subscribe({
          next: () => {
            console.log('Stripe account linked successfully');
            window.location.href = '/settings';
          },
          error: (error) => {
            console.error('Error updating Stripe account:', error);
            this.router.navigate(['/settings']); 
          }
        });
      } else {
        this.router.navigate(['/settings']);
      }
    });
  }
}