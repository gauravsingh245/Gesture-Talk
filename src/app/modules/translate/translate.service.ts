import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private http = inject(HttpClient);

  signedLanguages = [
    'ase', // American Sign Language (Fallback for English)
    'ins', // Indian Sign Language
    'jsl', // Japanese Sign Language
    'pks', // Pakistan Sign Language (Urdu/Punjabi)
  ];

  spokenLanguages = [
    'en',
    'hi',
    'bn',
    'mr',
    'ta',
    'te',
    'gu',
    'kn',
    'ml',
    'pa',
    'ur',
    'sd',
    'ne',
  ];

  private lastSpokenLanguageSegmenter: { language: string; segmenter: Intl.Segmenter };

  splitSpokenSentences(language: string, text: string): string[] {
    // If the browser does not support the Segmenter API (FireFox<127), return the whole text as a single segment
    if (!('Segmenter' in Intl)) {
      return [text];
    }

    // Construct a segmenter for the given language, can take 1ms~
    if (this.lastSpokenLanguageSegmenter?.language !== language) {
      this.lastSpokenLanguageSegmenter = {
        language,
        segmenter: new Intl.Segmenter(language, { granularity: 'sentence' }),
      };
    }
    const segments = this.lastSpokenLanguageSegmenter.segmenter.segment(text);
    return Array.from(segments).map(segment => segment.segment);
  }

  normalizeSpokenLanguageText(language: string, text: string): Observable<string> {
    const params = new URLSearchParams();
    params.set('lang', language);
    params.set('text', text);
    const url = 'https://sign.mt/api/text-normalization?' + params.toString();

    return this.http.get<{ text: string }>(url).pipe(map(response => response.text));
  }



  translateSpokenToSigned(text: string, spokenLanguage: string, signedLanguage: string): string {
    const api = 'https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose';
    return `${api}?text=${encodeURIComponent(text)}&spoken=${spokenLanguage}&signed=${signedLanguage}`;
  }

  translateToEnglish(text: string, from: string): Observable<string> {
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.openRouterKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Sign-MT'
    });

    const body = {
      model: 'google/gemini-flash-1.5',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Translate the following text into clear, simple English suitable for sign language translation. The input may be in a regional language (like Hindi, Bengali, etc.) or in "Hinglish" (Hindi spoken using English characters). Ensure the translation is natural and accurate. Return ONLY the translated text without any explanation or quotes.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    };

    console.log('TranslationService: Calling OpenRouter API...', body);

    return this.http.post<any>(url, body, { headers }).pipe(
      map(response => {
        const translatedText = response.choices?.[0]?.message?.content;
        if (!translatedText) {
          console.error('OpenRouter returned empty choices or error:', response);
        } else {
          console.log(`OpenRouter Translation (${from} -> en):`, { original: text, translated: translatedText });
        }
        return translatedText || text;
      }),
      catchError(error => {
        console.error('OpenRouter Translation Error:', error);
        return of(text);
      })
    );
  }

  translateToEnglishGoogleFree(text: string): Observable<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;

    return this.http.get<any[]>(url).pipe(
      map(response => {
        // Google Translate free API returns a nested array: [[["translated", "original", null, null, 1]], null, "language"]
        const translatedText = response[0]?.map((item: any[]) => item[0]).join('');
        console.log(`Google Translate Free (auto -> en):`, { original: text, translated: translatedText });
        return translatedText || text;
      }),
      catchError(error => {
        console.error('Google Translate Free Error:', error);
        return of(text);
      })
    );
  }
}
