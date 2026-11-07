import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookmarkSimpleIcon,
  CaretRightIcon,
  FlaskIcon,
  PlantIcon,
  TagIcon,
  TestTubeIcon,
  type Icon,
} from '@phosphor-icons/react';
import PageHeader from '@/components/PageHeader';
import { pageColumn } from '@/lib/layout';
import { cn } from '@/lib/utils';

const readList = (key: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

interface Row {
  to: string;
  icon: Icon;
  title: string;
  caption: string;
  badge?: string;
}

const RowGroup = ({ id, title, rows }: { id: string; title: string; rows: Row[] }) => (
  <section aria-labelledby={id}>
    <h2 id={id} className="title-3 mb-3 text-field-800">
      {title}
    </h2>
    <ul className="glass-panel divide-y divide-field-900/10 overflow-hidden rounded-3xl">
      {rows.map((row) => {
        const RowIcon = row.icon;
        return (
          <li key={row.to}>
            <Link
              to={row.to}
              className="flex items-center gap-4 px-4 py-4 transition-colors duration-300 hover:bg-white/50 active:bg-field-900/5"
            >
              <span className="icon-tile h-11 w-11 text-leaf-700">
                <RowIcon size={22} weight="duotone" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="title-4 block text-field-900">{row.title}</span>
                <span className="caption-5 mt-0.5 block text-field-500">{row.caption}</span>
              </span>
              {row.badge && (
                <span className="caption-3 shrink-0 rounded-full bg-leaf-600/10 px-2 py-1 text-leaf-800">{row.badge}</span>
              )}
              <CaretRightIcon size={16} className="shrink-0 text-field-400" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  </section>
);

const Advisory = () => {
  const { t } = useTranslation();
  const [savedGuides] = useState(() => readList('kisanmitra_saved_cultivation_guides'));
  const [savedFertilizer] = useState(() => readList('kisanmitra_saved_fertilizer_guides'));
  const [appliedGuidance] = useState(() => readList('kisanmitra_applied_guidance'));

  const saved: Row[] = [
    {
      to: '/my-saved-cultivation-guides',
      icon: BookmarkSimpleIcon,
      title: t('ui.saved_guides'),
      caption: savedGuides.length > 0
        ? t('ui.saved_guides_some', { count: savedGuides.length })
        : t('ui.saved_guides_empty'),
      badge: savedGuides.length > 0 ? t('ui.saved_count', { count: savedGuides.length }) : undefined,
    },
    {
      to: '/my-fertilizer-guidance',
      icon: FlaskIcon,
      title: t('ui.fertilizer_schedules'),
      caption: savedFertilizer.length > 0
        ? t('ui.fertilizer_schedules_some', { count: savedFertilizer.length, applied: appliedGuidance.length })
        : t('ui.fertilizer_schedules_empty'),
      badge: savedFertilizer.length > 0 ? t('ui.saved_count', { count: savedFertilizer.length }) : undefined,
    },
  ];

  const learn: Row[] = [
    { to: '/guides', icon: PlantIcon, title: t('ui.all_guides'), caption: t('ui.all_guides_body') },
    { to: '/soil-health', icon: TestTubeIcon, title: t('ui.soil_report'), caption: t('ui.soil_report_body') },
    { to: '/sell', icon: TagIcon, title: t('ui.my_listings'), caption: t('ui.my_listings_body') },
  ];

  return (
    <div className="min-h-screen pb-tabbar">
      <PageHeader title={t('ui.advisory_title')} subtitle={t('ui.advisory_subtitle')} />

      <main className={cn(pageColumn('wide'), 'stagger grid gap-8 pt-2 md:grid-cols-2 md:items-start md:gap-6')}>
        <RowGroup id="advisory-saved" title={t('ui.saved_section')} rows={saved} />
        <RowGroup id="advisory-learn" title={t('ui.learn_section')} rows={learn} />
      </main>
    </div>
  );
};

export default Advisory;
