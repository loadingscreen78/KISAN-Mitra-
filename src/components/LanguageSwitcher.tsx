import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', short: 'हिं' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const selectedLanguage = i18n.resolvedLanguage || i18n.language;

  return (
    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm border border-green-100">
      {languages.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out flex items-center space-x-1
              ${
                isSelected
                  ? 'bg-green-500 text-white shadow-sm transform scale-105'
                  : 'text-green-600 hover:bg-green-50'
              }
            `}
          >
            <span className="text-xs">{lang.flag}</span>
            <span className="text-xs font-semibold">{lang.short}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;