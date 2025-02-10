import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL: string;

  constructor(private httpClient: HttpClient) {
      this.API_URL = `${environment.apiEndpoint}/transactions`;
  }

  public getTransactionById(id: string): Observable<Transaction> {
    return this.httpClient.get<Transaction>(`${this.API_URL}/${id}`).pipe(
        first(), 
        map((transaction: Transaction) => plainToClass(Transaction, transaction))
      );
  }

  getTransactionByProjectId(projectId: string): Observable<any> {
    return this.httpClient.get(`${this.API_URL}/project/${projectId}`).pipe(
      first(),
      map((transaction: any) => plainToClass(Transaction, transaction))
    );
  }
}