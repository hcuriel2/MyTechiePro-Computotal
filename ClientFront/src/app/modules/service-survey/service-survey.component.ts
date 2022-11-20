import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SurveyChoice } from '../../shared/models/survey-choice';
import { ActivatedRoute, Router } from '@angular/router';

import { fakeSurveyData } from '../../shared/models/fakeDatabaseSurveys';
import { CategoryService } from 'src/app/shared/services/category.service';
import { Category } from 'src/app/shared/models/category';
import { first } from 'rxjs/operators';
import { Survey } from 'src/app/shared/models/survey';

@Component({
    selector: 'app-service-survey',
    templateUrl: './service-survey.component.html',
    styleUrls: ['./service-survey.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceSurveyComponent implements OnInit {
    /**
     * Container component to house survey sub components.
     */
    public currentModule: string[];
    public title: string;
    public isFirstModule = true;
    public goToSummary = false;
    public goToTechSelection = false;
    public survey: Survey;
    public categorySelection = '';
    public categories: Category[];
    public selectedCategory: Category | undefined;

    public choices: SurveyChoice[] = [];
    public summary?: string[];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private categoryService: CategoryService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.route.queryParams.subscribe((params) => {
            // Gets query params from URL.
            this.categorySelection = params.categoryName;

            this.isFirstModule = true;
        });
    }

    public ngOnInit(): void {
        this.getStaticData();
    }

    /**
     * Builds summary in preparation for summary component render.
     * @returns
     */
    public buildSummary(): string[] {
        const result: string[] = [];
        result.push('Category: ' + this.categorySelection);
        this.choices.forEach((element) => {
            result.push(element.toString());
        });
        return result;
    }

    public goToNextSurvey(message: string): void {
        this.choices.push(
            new SurveyChoice(this.survey.question, message, this.survey.key)
        );

        if (this.isLast(message)) {
            this.summary = this.buildSummary();
            this.goToSummary = true;
        } else {
            // this.survey = this.survey.contents?.find((s) => s === message) || '';
            this.currentModule = Object.keys(this.survey.contents);
            this.title = this.survey.question;
            this.isFirstModule = false;
        }
    }

    public goToPrevSurvey(): void {
        if (this.goToSummary) {
            this.goToSummary = false;
        }

        // Backtracks using choices to get "one level above".
        let temp = fakeSurveyData[this.categorySelection].survey;
        for (let i = 0; i < this.choices.length - 1; i++) {
            temp = temp.content[this.choices[i].getAnswer()];
        }

        this.survey = temp;

        const lastChoice = this.choices.pop()?.getAnswer();
        // console.log("Popped: " + lastChoice);

        // Nests in a level deeper for the next survey.
        this.currentModule = Object.keys(this.survey.contents);
        this.title = this.survey.question;
        this.isFirstModule = this.isFirst();
    }

    public renderTechSelection(): void {
        console.log('renderTechSelection');

        this.router.navigate(['/service-tech-select'], {
            queryParams: {
                category: this.categorySelection,
                service: this.choices[0].answer
            }
        });
    }

    /**
     * Returns if user is on first survey module.
     * @returns
     */
    public isFirst(): boolean {
        return this.choices.length === 0;
    }

    /**
     * Returns if user is on last survey module.
     * @param message a string
     * @returns
     */
    public isLast(message: string): boolean {
        return true;
    }

    private getStaticData(): void {
        this.categoryService
            .getAll()
            .pipe(first())
            .subscribe(
                (categories: Category[]) => {
                    this.categories = categories;

                    this.extractCategoryData();

                    this.changeDetectorRef.detectChanges();
                },
                (error) => {
                    console.error(
                        `Error in CarrierLaneRate.getStaticData(): ${error}`,
                        error
                    );
                }
            );
    }

    private extractCategoryData() {
        this.selectedCategory = this.categories.find(
            (category) => category.name === this.categorySelection
        );

        if (this.selectedCategory) {
            const question = `What ${this.selectedCategory.name} service is needed?`;
            const services = this.selectedCategory?.services.map(
                (service) => service.name
            );

            this.survey = new Survey(question, 'subCategory', services);

            this.title = this.survey.question;
            this.currentModule = this.survey.contents;
        }
    }
}
