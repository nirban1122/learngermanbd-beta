import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import en from '@/locales/en.json'
import bn from '@/locales/bn.json'

export type LanguageCode = 'en' | 'de' | 'bn' | 'tr' | 'ar' | 'fr' | 'es'

interface Language {
  code: LanguageCode
  label: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const translations: Record<LanguageCode, typeof en> = {
  en,
  de: en,
  bn,
  tr: en,
  ar: en,
  fr: en,
  es: en,
}

function isRTL(lang: LanguageCode): boolean {
  return lang === 'ar'
}

interface I18nContextType {
  language: LanguageCode
  setLanguage: (code: LanguageCode) => void
  t: (key: string, params?: Record<string, string | number>) => string
  languages: Language[]
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'app-language'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null
      if (stored && translations[stored]) return stored
      const browserLang = navigator.language.split('-')[0] as LanguageCode
      if (translations[browserLang]) return browserLang
    }
    return 'en'
  })

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, code)
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: unknown = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') return key

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return String(params[paramKey] ?? `{${paramKey}}`)
      })
    }

    return value
  }, [language])

  const isRTLV = isRTL(language)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = isRTLV ? 'rtl' : 'ltr'
      document.documentElement.lang = language
    }
  }, [language, isRTLV])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages,
    isRTL: isRTLV,
  }), [language, setLanguage, t, isRTLV])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}

export { languages }
