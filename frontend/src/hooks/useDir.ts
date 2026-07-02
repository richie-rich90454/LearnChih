import { useTranslation } from 'react-i18next'
export function useDir(): 'ltr' | 'rtl' {
  const { i18n } = useTranslation()
  // Currently only en/zh which are both LTR. This hook is ready for future RTL locales (ar, he, fa).
  return i18n.language === 'ar' || i18n.language === 'he' || i18n.language === 'fa' ? 'rtl' : 'ltr'
}
