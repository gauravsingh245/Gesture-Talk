import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AppTranslocoProviders } from './core/modules/transloco/transloco.module';
import { NgxsModuleOptions, provideStore } from '@ngxs/store';
import { SettingsState } from './modules/settings/settings.state';
import { environment } from '../environments/environment';

import { isSafari } from './core/constants';
import { provideAnimations } from '@angular/platform-browser/animations';

export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: !environment.production,
  selectorOptions: {
    // These Selector Settings are recommended in preparation for NGXS v4
    // (See above for their effects)
    suppressErrors: false,
    injectContainerState: false,
  },
  compatibility: {
    strictContentSecurityPolicy: true,
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),

    // Router
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Ionic theme
    provideIonicAngular({ mode: isSafari ? 'ios' : 'md' }),
    provideAnimations(),

    // HTTP Requests
    provideHttpClient(withFetch(), withInterceptorsFromDi()),

    ...AppTranslocoProviders,

    provideStore([SettingsState], ngxsConfig),
  ],
};
