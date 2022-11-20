import {
  HttpClient
} from '@angular/common/http';
import {
  TranslateHttpLoader
} from '@ngx-translate/http-loader';

export function createTranslateHttpLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
