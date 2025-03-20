import { Component, OnInit } from "@angular/core";
import { AboutUsService } from "src/app/shared/services/about-us.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutComponent implements OnInit {
  public aboutUsContent: string = "";

  constructor(private aboutUsService: AboutUsService) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
  }

  private fetchAboutUsContent(): void {
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response) => {
        this.aboutUsContent = response.content;
      },
      error: (error) => {
        console.error("Failed to fetch About Us content:", error);
      },
    });
  }
}