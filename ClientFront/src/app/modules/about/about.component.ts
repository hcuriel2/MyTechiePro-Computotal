import { Component, OnInit } from "@angular/core";
import { AboutUsService } from "src/app/shared/services/about-us.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
})
// About Us text for the client home page. The parent card lives in home.component.
export class AboutComponent implements OnInit {
  public aboutUsContent: string = "";

  constructor(private aboutUsService: AboutUsService) {}

  ngOnInit(): void {
    this.fetchAboutUsContent();
  }

  private fetchAboutUsContent(): void {
    this.aboutUsService.getAboutUsContent().subscribe({
      next: (response) => {
        // A missing body used to throw when we read response.content. Leave it blank instead.
        this.aboutUsContent = response && response.content ? response.content : "";
      },
      error: (error) => {
        console.error("Failed to fetch About Us content:", error);
        // Hide the paragraph if the request fails, rather than leaving old text on screen.
        this.aboutUsContent = "";
      },
    });
  }
}