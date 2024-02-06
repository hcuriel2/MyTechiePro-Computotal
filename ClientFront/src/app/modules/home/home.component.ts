import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";
import { CategoryEnum } from "src/app/shared/enums/Category.enum";
import { Category } from "src/app/shared/models/category";
import { Service } from "src/app/shared/models/service";
import { CategoryService } from "src/app/shared/services/category.service";
import { Ng2SearchPipe } from "ng2-search-filter";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  public isCustomer = true; // If technician, re-route to tech page.
  public categories: Category[];
  public readonly CATEGORY_ENUM: typeof CategoryEnum;
  public searchQuery: string;
  public showResults: boolean;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService
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

  // Displays homepage to client, if user is technician projects page is displayed instead
  public ngOnInit(): void {
    this.getStaticData();
    if (window.localStorage.getItem("user")) {
      if (
        JSON.parse(window.localStorage.getItem("user")!).userType ==
        "Professional"
      ) {
        console.log("firing?"); //check if user is customer
        this.router.navigate(["/projects"]);
      }
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
