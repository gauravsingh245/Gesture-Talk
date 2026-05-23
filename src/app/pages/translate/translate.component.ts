import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetSetting } from '../../modules/settings/settings.actions';
import { fromEvent, Observable } from 'rxjs';
import { BaseComponent } from '../../components/base/base.component';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';
import { TranslationService } from '../../modules/translate/translate.service';
import { Meta, Title } from '@angular/platform-browser';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslateMobileComponent } from './translate-mobile/translate-mobile.component';
import { TranslateDesktopComponent } from './translate-desktop/translate-desktop.component';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
  imports: [TranslateMobileComponent, TranslateDesktopComponent],
})
export class TranslateComponent extends BaseComponent implements OnInit {
  private store = inject(Store);
  private transloco = inject(TranslocoService);
  translation = inject(TranslationService);
  private mediaMatcher = inject(MediaMatcher);
  private meta = inject(Meta);
  private title = inject(Title);

  spokenToSigned$: Observable<boolean>;

  isMobile: MediaQueryList;

  constructor() {
    super();
    this.isMobile = this.mediaMatcher.matchMedia('(max-width: 991px)');

    // Default settings
    this.store.dispatch([
      new SetSetting('drawPose', true),
    ]);
  }

  ngOnInit(): void {
    this.transloco.events$
      .pipe(
        tap(() => {
          this.title.setTitle(this.transloco.translate('translate.title'));
          this.meta.updateTag(
            {
              name: 'description',
              content: this.transloco.translate('translate.description'),
            },
            'name=description'
          );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();




  }


}
