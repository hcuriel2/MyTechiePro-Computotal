import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-service-survey-module-summary',
    templateUrl: './service-survey-module-summary.component.html',
    styleUrls: ['./service-survey-module-summary.component.scss'],
})
export class ServiceSurveyModuleSummaryComponent implements OnInit {
    // Receives data from survey component parent.
    @Input() summary?: string[]; // decorate the property with @Input()

    @Output() prevSurveyRequest = new EventEmitter();
    @Output() goToTechSelectionRequest = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    prevSurvey(): void {
        console.log('prevSurvey');
        this.prevSurveyRequest.next();
    }

    pushSurvey(): void {
        console.log('Survey Post');
        this.goToTechSelectionRequest.next();
        console.log('uhhhh');
    }
}
