import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MAT_CALENDAR_RANGE_STRATEGY_PROVIDER_FACTORY } from '@angular/material/datepicker/date-range-selection-strategy';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Category } from '../models/category';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    private readonly API_URL: string;

    constructor(private httpClient: HttpClient) {
        this.API_URL = `${environment.apiEndpoint}/categories`;
    }

    public getAll(): Observable<Category[]> {
        return this.httpClient
            .get<Category[]>(this.API_URL)
            .pipe(map((categories) => plainToClass(Category, categories)));
    }
}
