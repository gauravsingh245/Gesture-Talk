import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, Store } from '@ngxs/store';
import {
  ChangeTranslation,
  SetSignedLanguage,
  SetSpokenLanguage,
  SetSpokenLanguageText,
  SuggestAlternativeText,

  TranslateToEnglish,
} from './translate.actions';
import { TranslationService } from './translate.service';

import { catchError, EMPTY, filter, Observable, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LanguageDetectionService } from './language-detection/language-detection.service';
import type { Pose } from 'pose-format';

import { getUrlParams } from '../../core/helpers/url';

export type InputMode = 'webcam' | 'upload' | 'text';



export interface TranslateStateModel {
  spokenLanguage: string;
  signedLanguage: string;
  detectedLanguage: string;

  spokenLanguageText: string;
  normalizedSpokenLanguageText?: string;
  translatedEnglishText?: string;
  spokenLanguageSentences: string[];



  signedLanguagePose: string | Pose; // TODO: use Pose object instead of URL
}

const initialState: TranslateStateModel = {
  spokenLanguage: 'en',
  signedLanguage: 'ins',
  detectedLanguage: null,

  spokenLanguageText: '',
  normalizedSpokenLanguageText: null,
  translatedEnglishText: null,
  spokenLanguageSentences: [],



  signedLanguagePose: null,
};

@Injectable()
@State<TranslateStateModel>({
  name: 'translate',
  defaults: initialState,
})
export class TranslateState implements NgxsOnInit {
  private store = inject(Store);
  private service = inject(TranslationService);
  private languageDetectionService = inject(LanguageDetectionService);

  constructor() {
  }

  ngxsOnInit(context: StateContext<TranslateStateModel>): any {
    this.initFromUrl(context);
    context.dispatch(ChangeTranslation);
  }

  initFromUrl({ dispatch, patchState }: StateContext<TranslateStateModel>) {
    const urlParams = getUrlParams();
    const urlSignedLanguage = urlParams.get('sil');
    if (urlSignedLanguage) {
      patchState({ signedLanguage: urlSignedLanguage });
    }
    const urlSpokenLanguage = urlParams.get('spl');
    if (urlSpokenLanguage) {
      patchState({ spokenLanguage: urlSpokenLanguage });
    }
    const urlTextParam = urlParams.get('text');
    if (urlTextParam) {
      dispatch(new SetSpokenLanguageText(urlTextParam));
    }
  }



  async detectLanguage(spokenLanguageText: string, patchState: StateContext<TranslateStateModel>['patchState']) {
    if (spokenLanguageText.length === 0) {
      patchState({ detectedLanguage: null });
      return;
    }

    await this.languageDetectionService.init();
    const detectedLanguage = await this.languageDetectionService.detectSpokenLanguage(spokenLanguageText);
    patchState({ detectedLanguage });
  }

  @Action(SetSpokenLanguage)
  async setSpokenLanguage(
    { patchState, getState, dispatch }: StateContext<TranslateStateModel>,
    { language }: SetSpokenLanguage
  ): Promise<void> {
    patchState({ spokenLanguage: language });

    // Load and apply language detection if selected
    if (!language) {
      const { spokenLanguageText } = getState();
      await this.detectLanguage(spokenLanguageText, patchState);
    }

    dispatch([ChangeTranslation, SuggestAlternativeText]);
  }

  @Action(SetSignedLanguage)
  async setSignedLanguage(
    { patchState, dispatch }: StateContext<TranslateStateModel>,
    { language }: SetSignedLanguage
  ): Promise<void> {
    patchState({ signedLanguage: language });
    dispatch(ChangeTranslation);
  }

  @Action(SetSpokenLanguageText)
  async setSpokenLanguageText(
    { patchState, getState, dispatch }: StateContext<TranslateStateModel>,
    { text }: SetSpokenLanguageText
  ): Promise<void> {
    const trimmedText = text.trim();
    patchState({ spokenLanguageText: text, normalizedSpokenLanguageText: null });

    const { spokenLanguage } = getState();
    const detectLanguage = this.detectLanguage(trimmedText, patchState);

    // Wait for language detection if language is not selected
    if (!spokenLanguage) {
      await detectLanguage;
    }

    // Get spoken language
    const { detectedLanguage } = getState();
    const assumedSpokenLanguage = spokenLanguage || detectedLanguage;
    patchState({ spokenLanguageSentences: this.service.splitSpokenSentences(assumedSpokenLanguage, trimmedText) });

    dispatch(ChangeTranslation);
  }

  @Action(SuggestAlternativeText, { cancelUncompleted: true })
  suggestAlternativeText({ patchState, getState }: StateContext<TranslateStateModel>) {
    const { spokenLanguageText, spokenLanguage, detectedLanguage } = getState();
    const trimmedText = spokenLanguageText.trim();
    if (!trimmedText || spokenLanguage !== detectedLanguage) {
      return EMPTY;
    }

    if ('navigator' in globalThis && !navigator.onLine) {
      return EMPTY;
    }

    return this.service.normalizeSpokenLanguageText(spokenLanguage, trimmedText).pipe(
      filter(text => text !== trimmedText),
      tap(text => patchState({ normalizedSpokenLanguageText: text }))
    );
  }

  @Action(TranslateToEnglish)
  translateToEnglish({ patchState, getState, dispatch }: StateContext<TranslateStateModel>): Observable<any> {
    const { spokenLanguageText } = getState();
    const trimmedText = spokenLanguageText.trim();

    if (!trimmedText) {
      return EMPTY;
    }

    return this.service.translateToEnglishGoogleFree(trimmedText).pipe(
      tap(englishText => {
        patchState({
          spokenLanguageText: englishText,
          spokenLanguage: 'en',
          normalizedSpokenLanguageText: null
        });
        dispatch(ChangeTranslation);
      })
    );
  }





  @Action(ChangeTranslation, { cancelUncompleted: true })
  changeTranslation({ getState, patchState, dispatch }: StateContext<TranslateStateModel>): Observable<any> {
    const {
      spokenLanguage,
      signedLanguage,
      detectedLanguage,
      spokenLanguageText,
      spokenLanguageSentences,
    } = getState();


    const trimmedSpokenLanguageText = spokenLanguageText.trim();
    if (!trimmedSpokenLanguageText) {
      patchState({ signedLanguagePose: null, translatedEnglishText: null });
      return EMPTY;
    }

    const actualSpokenLanguage = spokenLanguage || detectedLanguage;

    // Intermediate Translation Logic
    const getEnglishText = (): Observable<string> => {
      console.log(`ChangeTranslation: actualSpokenLanguage=${actualSpokenLanguage}, text=${trimmedSpokenLanguageText}`);
      if (actualSpokenLanguage === 'en') {
        return of(trimmedSpokenLanguageText);
      }
      return this.service.translateToEnglish(trimmedSpokenLanguageText, actualSpokenLanguage);
    };

    return getEnglishText().pipe(
      tap(englishText => {
        console.log(`ChangeTranslation: englishText result=${englishText}`);
        patchState({ translatedEnglishText: englishText });
      }),
      switchMap(englishText => {
        const path = this.service.translateSpokenToSigned(
          englishText,
          'en', // Always use English for sign pose generation
          signedLanguage
        );
        patchState({ signedLanguagePose: path });

        return of(null);
      })
    );
  }
}


