import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'हिंदी' },
];

/** Glass segmented control. The white thumb slides to the chosen language. */
const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('hi') ? 'hi' : 'en';
  const index = languages.findIndex((language) => language.code === current);

  return (
    <div role="radiogroup" aria-label="Language" className={cn('glass-pill grid grid-cols-2 p-1', className)}>
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-white shadow-[0_1px_3px_rgb(27_31_25/0.18),inset_0_0_0_0.5px_rgb(27_31_25/0.06)] transition-transform duration-500 ease-spring motion-reduce:transition-none"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {languages.map((language) => {
        const selected = language.code === current;
        return (
          <button
            key={language.code}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={language.name}
            onClick={() => i18n.changeLanguage(language.code)}
            className={cn(
              'button-xsm relative z-10 h-9 min-w-11 rounded-full px-3 transition-colors duration-300',
              selected ? 'text-leaf-800' : 'text-field-500 hover:text-field-800',
            )}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
