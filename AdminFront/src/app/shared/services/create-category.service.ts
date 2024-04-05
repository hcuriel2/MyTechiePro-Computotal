import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Category } from '../models/create-category';

@Injectable({
  providedIn: 'root',
})
export class CreateCategoryService {
  private readonly API_URL: string;
  private readonly AUTH_API_URL: string;

  constructor(private httpClient: HttpClient) {
    this.API_URL = `${environment.apiEndpoint}/categories`; //not sure if this is correct

    this.AUTH_API_URL = `${environment.apiEndpoint}/auth`;
  }

  // Create  a new category from the create category panel
  public createANewCategory(newCategory: Category) {
    
    
    return this.httpClient
      .post<Category>(`${this.API_URL}`, newCategory)
      // .pipe(
      //   map((newCategory: Category) => {
      //     localStorage.setItem('newCategory', JSON.stringify(newCategory));
      //     return newCategory;
      //   })
      // );
  }
}
