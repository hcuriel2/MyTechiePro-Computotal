export class ServiceSurvey {
    static serviceNum = 0;
    surveyQuestions: string[];
    serviceNum: number;
    // surveyModules = [
    //   [
    //     "Choice 1",
    //     "Choice 2",
    //     "Choice 3",
    //     "Choice 4",
    //     "Choice 1",
    //     "Choice 2",
    //     "Choice 3",
    //   ],
    //   ["Apples", "Bananas", "Orange", "Pineable", "Grapes"],
    //   ["Horse", "Ape", "Bunny", "Human", "Dog", "Cat", "Parrot", "Budgie"],
    // ];
    surveyModules: string[][];
    numOfModules: number;
    currentModuleIndex = 0;
    currentModule: string[];
    currentQuestion: string;

    constructor(surveyTitles: string[], surveyModules: string[][]) {
        this.surveyQuestions = surveyTitles;
        this.serviceNum = ServiceSurvey.serviceNum++;
        this.currentQuestion = this.surveyQuestions[0];
        this.surveyModules = surveyModules;
        this.numOfModules = this.surveyModules.length;
        this.currentModule = this.surveyModules[0];
    }

    public isLastModule(): boolean {
        return this.currentModuleIndex == this.numOfModules - 1;
    }

    public isFirstModule(): boolean {
        return this.currentModuleIndex == 0;
    }

    public incrementCurrentModule(): void {
        this.currentModuleIndex++;
        this.currentModule = this.surveyModules[this.currentModuleIndex];
    }

    public decrementCurrentModule(): void {
        this.currentModuleIndex--;
        this.currentModule = this.surveyModules[this.currentModuleIndex];
    }

    public getCurrentModule(): string[] {
        var temp = this.currentModule;
        return temp;
    }

    public getTitle(): string {
        return this.surveyQuestions[this.currentModuleIndex];
    }

    public setModuleIndex(index: number): void {
        this.currentModuleIndex = index;
    }
}
