import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
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

  public getTransactionByProjectId(projectId: string): Observable<Transaction> {
    return this.httpClient.get<Transaction>(`${this.API_URL}/project/${projectId}`).pipe(
      first(),
      map((transaction: Transaction) => plainToClass(Transaction, transaction))
    );
  }

  public checkPaymentStatus(sessionId: string, transactionId: string): Observable<any> {
    return this.httpClient.get(`${this.API_URL}/status`, {
      params: {
        session_id: sessionId,
        transactionId: transactionId
      }
    });
  }
}