import { HttpClient } from '@angular/common/http';
import { Translation, TRANSLOCO_SCOPE, TranslocoLoader } from '@jsverse/transloco';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { catchError, Observable, of } from 'rxjs';
import { BUILD_VERSION } from '../../../../build-version';

@Injectable({ providedIn: 'root' })
export class HttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getTranslation(langPath: string): Observable<Translation> {
    // Browser environment: use HTTP with cache buster (timestamp generated at build time)
    const assetPath = `assets/i18n/${langPath}.json?v=${BUILD_VERSION}`;
    return this.http.get<Translation>(assetPath).pipe(
      catchError(err => {
        console.error(`Couldn't load translation file '${assetPath}'`, err);
        throw err;
      })
    );
  }
}


export const translocoScopes = {
  provide: TRANSLOCO_SCOPE,
  useValue: ['', 'countries', 'languages', 'signedLanguagesShort'],
};
