import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";
import { CategoryEnum } from "src/app/shared/enums/Category.enum";
import { Category } from "src/app/shared/models/category";
import { Service } from "src/app/shared/models/service";
import { CategoryService } from "src/app/shared/services/category.service";
import { Ng2SearchPipe } from "ng2-search-filter";
import { User } from "src/app/shared/models/user";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public user: User | null = null;
  public isCustomer: boolean | null = null;
  isProfessional: boolean = false;
  public categories: Category[];
  public readonly CATEGORY_ENUM: typeof CategoryEnum;
  public searchQuery: string;
  public showResults: boolean;

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private elementRef: ElementRef
  ) {
    this.CATEGORY_ENUM = CategoryEnum;
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params.q;
    });
    this.showResults = !this.searchQuery ? false : this.searchQuery !== "";
  }

  public hasMatchingResults(category: any): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === "") {
      return true; // Always show results if search query is empty
    }

    for (const service of category.services) {
      if (service.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return true; // Found a matching result
      }
    }
    return false; // No matching results found for this category
  }

  public noResult(): boolean {
    for (const category of this.categories) {
      if (this.hasMatchingResults(category)) {
        return false; // Found a matching result in at least one category
      }
    }
    return true; // No matching results found in any category
  }

  // Function to clear the search input
  public clearSearchInput(): void {
    this.searchQuery = "";
    this.showResults = false;
  }

  /**
   * Initialize the component by subscribing to user updates and
   * routing based on the user's role.
   */
  public ngOnInit(): void {
    // Fetch static data needed for the component.
    this.getStaticData();

    // Subscribe to the AuthService to get the user data
    this.authService.user.subscribe((userData: User | null) => {
      if (userData) {
        this.user = userData;
        this.isProfessional = userData.userType === "Professional";
        this.isCustomer = userData.userType === "Client";

        // Use setTimeout to delay redirection logic to the end of the event loop,
        // allowing the initial view to render first.
        setTimeout(() => {
          // Redirect professionals to the projects page
          if (this.isProfessional) {
            this.router.navigate(["/projects"]);
          }
        });
      }
    });
  }

  @HostListener("document:click", ["$event"])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // Clicked outside the search container, hide results
      this.showResults = false;
    }
  }

  // Search bar method, redirects to tech select when category is selected
  public selectService(
    categorySelection: string,
    serviceSelection: string
  ): void {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery },
        queryParamsHandling: "merge",
      })
      .finally(() => {
        this.router.navigate(["/service-tech-select"], {
          queryParams: {
            category: categorySelection,
            service: serviceSelection,
          },
        });
      });
  }

  // After selecting a category redirect to services page
  public goToServiceSurvey(categoryChoice: string): void {
    this.router.navigate(["/service-survey"], {
      queryParams: { categoryName: categoryChoice },
    }); // Sends category to render right survey.
  }

  private getStaticData(): void {
    this.categoryService
      .getAll()
      .pipe(first())
      .subscribe(
        (categories: Category[]) => {
          this.categories = categories;

          this.changeDetectorRef.markForCheck();
        },
        (error) => {
          console.error(
            `Error in CarrierLaneRate.getStaticData(): ${error}`,
            error
          );
        }
      );
  }
}
