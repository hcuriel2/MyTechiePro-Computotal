import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { marked } from "marked";
import { AboutUsService } from "src/app/shared/services/about-us.service";
import { AuthService } from "src/app/shared/services/auth.service";

type Section = "whoWeAre" | "appendix";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit, OnDestroy {
  public section: Section = "whoWeAre";
  public title = "Who We Are";
  public content = "";
  public draft = "";
  public isAdmin = false;
  public isEditing = false;
  public isSaving = false;
  private subscriptions = new Subscription();

  constructor(
    private aboutUsService: AboutUsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.data.subscribe((data) => {
        this.section = data.section === "appendix" ? "appendix" : "whoWeAre";
        this.title = this.section === "appendix" ? "Appendix" : "Who We Are";
        this.isEditing = false;
        this.fetchContent();
      })
    );
    this.subscriptions.add(
      this.authService.user.subscribe((user) => {
        this.isAdmin = !!user && user.userType === "Admin";
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Angular sanitizes the HTML bound through [innerHTML]
  public get renderedContent(): string {
    return marked.parse(this.isEditing ? this.draft : this.content);
  }

  public startEditing(): void {
    this.draft = this.content;
    this.isEditing = true;
  }

  public cancelEditing(): void {
    this.isEditing = false;
  }

  public save(): void {
    const update =
      this.section === "appendix"
        ? { appendixContent: this.draft }
        : { content: this.draft };

    this.isSaving = true;
    this.aboutUsService.updateAboutUsContent(update).subscribe({
      next: () => {
        this.content = this.draft;
        this.isEditing = false;
        this.isSaving = false;
        this.snackBar.open(`${this.title} updated successfully`, "Close", {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error("Failed to update content:", error);
        this.isSaving = false;
        this.snackBar.open(`Failed to update ${this.title}`, "Close", {
          duration: 3000,
        });
      },
    });
  }

  private fetchContent(): void {
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response) => {
        this.content =
          (this.section === "appendix"
            ? response?.appendixContent
            : response?.content) || "";
      },
      error: (error) => {
        console.error("Failed to fetch content:", error);
      },
    });
  }
}
