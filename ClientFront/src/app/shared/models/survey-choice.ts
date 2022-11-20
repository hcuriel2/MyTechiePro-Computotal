export class SurveyChoice {
    question: string;
    answer: string;
    key: string;
  
    constructor(q: string, a: string, key: string) {
      this.question = q;
      this.answer = a;
      this.key = key;
    }

    getAnswer(): string {
      return this.answer
    }

    getKey(): string {
      return this.key
    }
  
    toString(): string {
      return this.question + " (" + this.key + ")" + ": " + this.answer;
    }
  }