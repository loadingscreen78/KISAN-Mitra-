import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { NavigationType, Router } from 'react-router-dom';
import { getAppHistory, type HistoryUpdate } from '@/lib/navigation';

/**
 * Drop in replacement for <BrowserRouter> that animates page changes with the
 * View Transitions API. The browser snapshots the outgoing page, React renders
 * the next one synchronously inside the transition, and CSS in index.css
 * decides how the two snapshots move (see "Page transitions").
 *
 * Browsers without the API, reduced motion users and silent redirects get an
 * instant swap with the same scroll handling.
 */

type PageTransition = ReturnType<Document['startViewTransition']>;

const scrollPositions = new Map<string, number>();
let activeTransition: PageTransition | null = null;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function canAnimate(update: HistoryUpdate) {
  return (
    update.direction !== 'none' &&
    typeof document.startViewTransition === 'function' &&
    document.visibilityState === 'visible' &&
    !prefersReducedMotion()
  );
}

function runPageTransition(update: HistoryUpdate, commit: () => void) {
  const root = document.documentElement;
  const origin = update.origin ?? { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };

  root.dataset.nav = update.direction;
  root.style.setProperty('--vt-origin-x', `${Math.round(origin.x)}px`);
  root.style.setProperty('--vt-origin-y', `${Math.round(origin.y)}px`);

  let transition: PageTransition;
  try {
    transition = document.startViewTransition(() => flushSync(commit));
  } catch {
    delete root.dataset.nav;
    commit();
    return;
  }

  activeTransition = transition;
  // A newer navigation skips this one; that rejection is expected.
  transition.ready.catch(() => undefined);
  const settle = () => {
    if (activeTransition !== transition) return;
    activeTransition = null;
    delete root.dataset.nav;
  };
  transition.finished.then(settle, settle);
}

export function TransitionRouter({ children }: { children: ReactNode }) {
  const history = getAppHistory();
  const [state, setState] = useState(() => ({ action: history.action, location: history.location }));
  const pendingScroll = useRef<number | null>(null);

  useLayoutEffect(
    () =>
      history.listen((update) => {
        scrollPositions.set(update.previous.key, window.scrollY);

        // Query or hash changes stay where they are; new pages start at the
        // top; back and forward return to where the reader left off.
        const samePath = update.previous.pathname === update.location.pathname;
        pendingScroll.current = samePath
          ? null
          : update.action === NavigationType.Pop
            ? (scrollPositions.get(update.location.key) ?? 0)
            : 0;

        const commit = () => setState({ action: update.action, location: update.location });
        if (canAnimate(update)) runPageTransition(update, commit);
        else commit();
      }),
    [history],
  );

  // Runs inside flushSync during a transition, so the new snapshot is taken
  // at the right scroll position.
  useLayoutEffect(() => {
    const top = pendingScroll.current;
    pendingScroll.current = null;
    if (top !== null) window.scrollTo({ top, left: 0, behavior: 'instant' });
  }, [state.location]);

  return (
    <Router location={state.location} navigationType={state.action} navigator={history}>
      {children}
    </Router>
  );
}

export default TransitionRouter;
