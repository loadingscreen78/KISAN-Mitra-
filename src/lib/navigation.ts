/**
 * Browser history for the app, with enough bookkeeping to animate page changes.
 *
 * React Router's <BrowserRouter> commits a new location the moment the URL
 * changes, which leaves no chance to snapshot the outgoing page. This history
 * honours the same Navigator contract, but reports every change to
 * <TransitionRouter> together with two extra facts:
 *
 *   direction  forward (pop in) or back (outro), from the history index
 *   origin     the centre of the element that was tapped to open the page, so
 *              the page grows out of it and later shrinks back into it
 *
 * It also remembers the pathname of every entry in this tab, which lets a
 * header back button return to an existing entry instead of stacking a new one.
 */
import { NavigationType, createPath, parsePath } from 'react-router-dom';
import type { Location, Navigator, To } from 'react-router-dom';

export type NavDirection = 'forward' | 'back' | 'none';

export interface Point {
  x: number;
  y: number;
}

export interface HistoryUpdate {
  action: NavigationType;
  location: Location;
  previous: Location;
  direction: NavDirection;
  origin: Point | null;
}

type Listener = (update: HistoryUpdate) => void;

interface EntryState {
  usr: unknown;
  key: string;
  idx: number;
  origin?: Point | null;
}

export interface AppHistory extends Navigator {
  readonly action: NavigationType;
  readonly location: Location;
  readonly index: number;
  listen(listener: Listener): () => void;
  /** History index of the closest earlier entry showing `pathname`, or -1. */
  findBack(pathname: string): number;
}

const STACK_KEY = 'kisanmitra:nav-stack';
/** A tap older than this did not cause the navigation (auth popups, timers). */
const PRESS_TTL_MS = 1200;
const PRESSABLE =
  'a[href],button,[role="button"],[role="tab"],[role="link"],[data-pop-origin],.cursor-pointer';

let lastPress: (Point & { at: number }) | null = null;
let pendingDirection: NavDirection | null = null;

/**
 * Plays the next push or replace as a given direction. Used by header back
 * buttons that cannot pop history, so leaving still looks like going back.
 */
export function markNextNavigation(direction: NavDirection) {
  pendingDirection = direction;
}

function recordPress(target: EventTarget | null, fallback?: Point) {
  const element = target instanceof Element ? target.closest(PRESSABLE) : null;
  if (element) {
    const rect = element.getBoundingClientRect();
    lastPress = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, at: performance.now() };
  } else if (fallback) {
    lastPress = { ...fallback, at: performance.now() };
  }
}

function takePressOrigin(): Point | null {
  const press = lastPress;
  lastPress = null;
  if (!press || performance.now() - press.at > PRESS_TTL_MS) return null;
  return { x: press.x, y: press.y };
}

function readStack(): (string | null)[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STACK_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStack(stack: (string | null)[]) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack));
  } catch {
    // Private mode or full storage: back buttons fall back to replacing.
  }
}

const createKey = () => Math.random().toString(36).slice(2, 10);

const samePage = (a: Location, b: Location) =>
  a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;

function createAppHistory(): AppHistory {
  const globalHistory = window.history;
  // Scroll is restored by TransitionRouter once the page has rendered.
  globalHistory.scrollRestoration = 'manual';

  const readState = () => (globalHistory.state ?? {}) as Partial<EntryState>;
  const readLocation = (): Location => {
    const { pathname, search, hash } = window.location;
    const state = readState();
    return { pathname, search, hash, state: state.usr ?? null, key: state.key ?? 'default' };
  };

  let index = readState().idx ?? 0;
  if (readState().idx == null) {
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, '');
  }
  let action = NavigationType.Pop;
  let location = readLocation();
  let origin: Point | null = readState().origin ?? null;
  let listener: Listener | null = null;

  const stack = readStack();
  stack[index] = location.pathname;
  writeStack(stack);

  const toLocation = (to: To, state: unknown): Location => ({
    pathname: location.pathname,
    search: '',
    hash: '',
    ...(typeof to === 'string' ? parsePath(to) : to),
    state,
    key: createKey(),
  });

  const takeDirection = (fallback: NavDirection) => {
    const direction = pendingDirection ?? fallback;
    pendingDirection = null;
    return direction;
  };

  function push(to: To, state?: unknown) {
    const previous = location;
    const next = toLocation(to, state);
    const pressOrigin = takePressOrigin();
    const direction = samePage(previous, next) ? 'none' : takeDirection('forward');
    const entry: EntryState = {
      usr: next.state,
      key: next.key,
      idx: index + 1,
      origin: direction === 'forward' ? pressOrigin : null,
    };
    const url = createPath(next);
    try {
      globalHistory.pushState(entry, '', url);
    } catch (error) {
      // Same recovery as React Router: state too large for the browser to store.
      if (error instanceof DOMException && error.name === 'DataCloneError') throw error;
      window.location.assign(url);
      return;
    }
    const leavingOrigin = origin;
    index = entry.idx;
    action = NavigationType.Push;
    location = next;
    origin = entry.origin ?? null;
    stack[index] = next.pathname;
    stack.length = index + 1;
    writeStack(stack);
    listener?.({
      action,
      location,
      previous,
      direction,
      origin: direction === 'back' ? leavingOrigin : pressOrigin,
    });
  }

  function replace(to: To, state?: unknown) {
    const previous = location;
    const next = toLocation(to, state);
    const pressOrigin = takePressOrigin();
    // Redirects replace silently unless a caller asked for an animation.
    const direction = samePage(previous, next) ? 'none' : takeDirection('none');
    const entry: EntryState = {
      usr: next.state,
      key: next.key,
      idx: index,
      origin: direction === 'forward' ? pressOrigin : null,
    };
    globalHistory.replaceState(entry, '', createPath(next));
    const leavingOrigin = origin;
    action = NavigationType.Replace;
    location = next;
    origin = entry.origin ?? null;
    stack[index] = next.pathname;
    writeStack(stack);
    listener?.({
      action,
      location,
      previous,
      direction,
      origin: direction === 'back' ? leavingOrigin : pressOrigin,
    });
  }

  function handlePop() {
    const previous = location;
    const leavingOrigin = origin;
    const state = readState();
    let delta: number;

    if (state.idx == null) {
      // The browser created this entry itself (an in-page #anchor link).
      delta = 1;
      index += 1;
      globalHistory.replaceState({ ...globalHistory.state, idx: index, key: createKey() }, '');
    } else {
      delta = state.idx - index;
      index = state.idx;
    }

    pendingDirection = null;
    action = NavigationType.Pop;
    location = readLocation();
    origin = readState().origin ?? null;
    stack[index] = location.pathname;
    writeStack(stack);

    const direction: NavDirection =
      delta === 0 || samePage(previous, location) ? 'none' : delta < 0 ? 'back' : 'forward';

    listener?.({
      action,
      location,
      previous,
      direction,
      // One step back shrinks into the card that opened the page; a longer
      // jump has no meaningful card on screen, so it uses the centre.
      origin: direction === 'back' ? (delta === -1 ? leavingOrigin : null) : origin,
    });
  }

  window.addEventListener('popstate', handlePop);
  window.addEventListener('pointerdown', (event) => recordPress(event.target, { x: event.clientX, y: event.clientY }), {
    capture: true,
    passive: true,
  });
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') recordPress(document.activeElement);
    },
    { capture: true, passive: true },
  );

  return {
    get action() {
      return action;
    },
    get location() {
      return location;
    },
    get index() {
      return index;
    },
    createHref: (to: To) => (typeof to === 'string' ? to : createPath(to)),
    encodeLocation(to: To) {
      const url = new URL(typeof to === 'string' ? to : createPath(to), window.location.origin);
      return { pathname: url.pathname, search: url.search, hash: url.hash };
    },
    push,
    replace,
    go: (delta: number) => globalHistory.go(delta),
    listen(next: Listener) {
      listener = next;
      return () => {
        if (listener === next) listener = null;
      };
    },
    findBack(pathname: string) {
      for (let i = index - 1; i >= 0; i -= 1) {
        if (stack[i] === pathname) return i;
      }
      return -1;
    },
  };
}

let appHistory: AppHistory | null = null;

export function getAppHistory(): AppHistory {
  appHistory ??= createAppHistory();
  return appHistory;
}
