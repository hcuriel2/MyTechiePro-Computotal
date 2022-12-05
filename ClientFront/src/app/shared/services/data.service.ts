import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// this service let's use exchange a string message between two unrelated components
// see contact us component for more detail
// the two components must use this service, example contactus component and contact-us-dialog component
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private messageSource = new BehaviorSubject<string>("default message");
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
