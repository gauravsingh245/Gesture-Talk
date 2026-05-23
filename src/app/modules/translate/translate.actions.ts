import { InputMode } from './translate.state';

export class SetSpokenLanguage {
  static readonly type = '[Translate] Set Spoken Language';

  constructor(public language: string) { }
}

export class SetSignedLanguage {
  static readonly type = '[Translate] Set Signed Language';

  constructor(public language: string) { }
}

export class SetSpokenLanguageText {
  static readonly type = '[Translate] Set Spoken Language Text';

  constructor(public text: string) { }
}



export class ChangeTranslation {
  static readonly type = '[Translate] Change Translation';
}

export class SuggestAlternativeText {
  static readonly type = '[Translate] Suggest Alternative Text';
}



export class TranslateToEnglish {
  static readonly type = '[Translate] Translate To English';
}

