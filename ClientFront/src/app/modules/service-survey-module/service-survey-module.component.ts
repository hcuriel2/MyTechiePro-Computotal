import {
    Component,
    Input,
    OnInit,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
} from '@angular/core';

@Component({
    selector: 'app-service-survey-module',
    templateUrl: './service-survey-module.component.html',
    styleUrls: ['./service-survey-module.component.scss'],
})
export class ServiceSurveyModuleComponent implements OnInit {
    // Receives data from survey component parent.
    @Input() title: string; // decorate the property with @Input()
    @Input() surveyModule: string[];
    @Input() lastChoices: string[];
    @Input() isFirstModule: boolean;

    // Returns data to parent component
    @Output() nextSurveyRequest = new EventEmitter<string>();
    @Output() prevSurveyRequest = new EventEmitter();

    choice: any = null;
    message: string;
    searchQuery: string = ''; // Holds the current search query
    filteredChoices: string[] = []; // Holds the filtered list of choices


    constructor() {
        this.message = '';
        this.title = '';
        this.surveyModule = [];
        this.isFirstModule = false;
        this.lastChoices = [];
    }

    ngOnInit(): void {
        this.choice = this.lastChoices[this.lastChoices.length - 1];
        this.filteredChoices = [...this.surveyModule]; // Initially, all choices are shown
      }


      // Update the search query and filter choices
    updateSearch(query: string): void {
    this.searchQuery = query;
    this.filteredChoices = this.surveyModule.filter((choice) =>
      choice.toLowerCase().includes(query.toLowerCase())
    );
    }


    selectChoice(selectedChoice: string): void {
        this.choice = selectedChoice;
        this.searchQuery = ''; // clear the search query
        this.filteredChoices = [...this.surveyModule]; // Reset filtered choices
      }
      

    nextSurvey(event: any): void {
        // No choice on survey
        if (this.choice == null) {
            console.log('Invalid Choice');
            this.message = 'Required!';
        } else {
            this.nextSurveyRequest.next(this.choice);
            this.message = '';
            this.choice = null;
        }
    }

    prevSurvey(): void {
        if (!this.isFirstModule) {
            this.choice = this.lastChoices[this.lastChoices.length - 1];
            this.prevSurveyRequest.next();
        } else {
            console.log('Unable to backtrack');
        }
    }
}
