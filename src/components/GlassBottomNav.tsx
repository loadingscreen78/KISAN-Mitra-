import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpenTextIcon,
  CameraIcon,
  ChatCircleDotsIcon,
  HouseIcon,
  StorefrontIcon,
  type Icon,
} from '@phosphor-icons/react';
import { useGoBack } from '@/hooks/useGoBack';

interface Tab {
  id: 'home' | 'advisory' | 'shop' | 'mitra';
  to: string;
  label: string;
  icon: Icon;
  /** Routes that belong to this tab's section. */
  section: string[];
}

const TABS: Tab[] = [
  { id: 'home', to: '/home', label: 'navigation.home', icon: HouseIcon, section: ['/home', '/weather'] },
  { id: 'advisory', to: '/advisory', label: 'navigation.advisory', icon: BookOpenTextIcon, section: ['/advisory'] },
  { id: 'shop', to: '/shop', label: 'navigation.shop', icon: StorefrontIcon, section: ['/shop'] },
  { id: 'mitra', to: '/mitra', label: 'navigation.mitra', icon: ChatCircleDotsIcon, section: ['/mitra'] },
];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Floating liquid glass tab bar, rendered once by the app shell so it stays put
 * while pages transition underneath it. A glass lens slides to the current tab
 * and stretches like a drop on the way. Diagnose, the app's main action, is a
 * separate drop of tinted glass beside the bar.
 */
export function GlassBottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const goBack = useGoBack();
  const lensRef = useRef<HTMLSpanElement>(null);

  const activeIndex = TABS.findIndex((tab) => tab.section.includes(pathname));
  const lastIndex = useRef(Math.max(activeIndex, 0));
  if (activeIndex >= 0) lastIndex.current = activeIndex;
  const previousIndex = useRef(activeIndex);

  useLayoutEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = activeIndex;
    const lens = lensRef.current;
    if (!lens || from < 0 || activeIndex < 0 || from === activeIndex || prefersReducedMotion()) return;

    const stretch = 1 + Math.min(Math.abs(activeIndex - from), 3) * 0.12;
    lens.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: `scale(${stretch}, 0.86)`, offset: 0.35 },
        { transform: 'scale(0.97, 1.03)', offset: 0.7 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
  }, [activeIndex]);

  // Tapping the current tab scrolls to the top. Tapping it from a screen inside
  // its section returns to the section root with the back animation.
  const handleTabClick = (event: MouseEvent, to: string, inSection: boolean) => {
    if (!inSection) return;
    event.preventDefault();
    if (pathname === to) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    else goBack(to);
  };

  const onDiagnose = pathname === '/diagnose';

  return (
    <nav aria-label="Main" className="tabbar">
      <div className="tabbar__row">
        <div className="tabbar__bar glass">
          <span
            aria-hidden="true"
            className="tabbar__lens"
            style={{ '--tab-index': lastIndex.current, opacity: activeIndex < 0 ? 0 : 1 } as CSSProperties}
          >
            <span ref={lensRef} className="tabbar__lens-body" />
          </span>

          {TABS.map((tab, index) => {
            const inSection = index === activeIndex;
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.id}
                to={tab.to}
                className="tabbar__tab"
                data-active={inSection}
                aria-current={pathname === tab.to ? 'page' : undefined}
                onClick={(event) => handleTabClick(event, tab.to, inSection)}
              >
                <TabIcon className="tabbar__icon" weight={inSection ? 'fill' : 'regular'} aria-hidden="true" />
                <span className="tabbar__label">{t(tab.label)}</span>
              </Link>
            );
          })}
        </div>

        <Link
          to="/diagnose"
          className="tabbar__action"
          data-active={onDiagnose}
          aria-label={t('navigation.diagnose')}
          aria-current={onDiagnose ? 'page' : undefined}
          onClick={(event) => handleTabClick(event, '/diagnose', onDiagnose)}
        >
          <CameraIcon size={26} weight="fill" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}

export default GlassBottomNav;
