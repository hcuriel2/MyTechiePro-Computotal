export class Survey {
    question: string;
    key: string;
    contents: string[];

    constructor(question: string, key: string, contents: string[]) {
        this.question = question;
        this.key = key;
        this.contents = contents;
    }
}
