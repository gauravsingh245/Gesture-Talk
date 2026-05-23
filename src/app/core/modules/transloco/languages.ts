export const SITE_LANGUAGES = [
  { key: 'en', value: 'English' },
  { key: 'hi', value: 'हिन्दी' },
  { key: 'bn', value: 'বাংলা' },
  { key: 'mr', value: 'मराठी' },
  { key: 'ta', value: 'தமிழ்' },
  { key: 'te', value: 'తెలుగు' },
  { key: 'gu', value: 'ગુજરાતી' },
  { key: 'kn', value: 'ಕನ್ನಡ' },
  { key: 'ml', value: 'മലയാളം' },
  { key: 'pa', value: 'ਪੰਜਾਬੀ' },
  { key: 'ur', value: 'اردو' },
  { key: 'sd', value: 'سنڌي' },
  { key: 'ne', value: 'नेपाली' },
];

export function languageCodeNormalizer(languageCode) {
  let [navigatorParam] = languageCode.split('-');
  if (navigatorParam === 'zh') {
    // Handle simplified (china) vs traditional (hong kong, taiwan) chinese
    navigatorParam = ['zh-CN', 'zh-Hans'].includes(languageCode) ? 'zh-CN' : 'zh-HK';
  }
  if (navigatorParam === 'pt') {
    // Handle brazilian vs european portuguese
    navigatorParam = languageCode;
  }
  if (navigatorParam === 'iw') {
    // Handle Hebrew
    navigatorParam = 'he';
  }
  return navigatorParam;
}
