import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { pageColumn, type PageWidth } from '@/lib/layout';
import { useGoBack } from '@/hooks/useGoBack';

interface PageHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Parent route the back button returns to. `true` steps back through history. */
  back?: string | true;
  /** Replaces the default back behaviour, for screens that clean up first. */
  onBack?: () => void;
  /** Replaces the back button and title, for the Home greeting. */
  leading?: ReactNode;
  actions?: ReactNode;
  width?: PageWidth;
  className?: string;
}

/**
 * Sticky header in the style of iOS 26: controls float as glass over the page,
 * and a frosted edge fades in only once content scrolls underneath. Scroll
 * state comes from an IntersectionObserver, not a scroll listener.
 */
export function PageHeader({
  title,
  subtitle,
  back,
  onBack,
  leading,
  actions,
  width = 'wide',
  className,
}: PageHeaderProps) {
  const { t } = useTranslation();
  const goBack = useGoBack();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const showBack = Boolean(back || onBack);
  const handleBack = () => {
    if (onBack) onBack();
    else goBack(back === true ? undefined : back);
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="-mb-px h-px" />
      <header className={cn('page-header', className)} data-scrolled={scrolled}>
        <div aria-hidden="true" className="page-header__edge" />
        <div className={cn('page-header__inner flex items-center gap-3', pageColumn(width))}>
          {leading ?? (
            <>
              {showBack && (
                <button type="button" onClick={handleBack} className="glass-icon-button" aria-label={t('navigation.back')}>
                  <ArrowLeftIcon size={20} weight="bold" aria-hidden="true" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="heading-6 truncate text-field-900">{title}</h1>
                {subtitle && <p className="caption-5 truncate text-field-500">{subtitle}</p>}
              </div>
            </>
          )}
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
    </>
  );
}

export default PageHeader;
