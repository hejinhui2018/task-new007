import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import type { PortalLocationState } from './types';

/**
 * 滚动与焦点恢复。
 *
 * 关键设计：
 * - 关闭浏览器自带的滚动恢复（scrollRestoration = 'manual'），由这里统一管理。
 * - 滚动位置同时按「历史条目 key」和「路径」各存一份：
 *   - 按 key：浏览器前进/后退（POP）时精确恢复该条目离开时的位置；
 *   - 按路径：整页刷新后（条目 key 可能变化）以及目录页「继续学习」时恢复。
 * - 焦点按历史条目 key 记录最后聚焦的可交互元素（data-focus-id），
 *   POP 回来时恢复；覆盖层（模态/抽屉）内部的焦点不记录。
 * - 全部存入 sessionStorage：刷新可恢复，关闭标签页即清理。
 */

const SCROLL_KEY = 'corp-portal:scroll:v1';
const FOCUS_KEY = 'corp-portal:focus:v1';

interface ScrollPos {
  x: number;
  y: number;
}

interface ScrollStore {
  byKey: Record<string, ScrollPos>;
  byPath: Record<string, ScrollPos>;
}

function readSession<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function writeSession(key: string, value: unknown): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储不可用时静默降级
  }
}

export function saveScrollPosition(locationKey: string, path: string, pos: ScrollPos): void {
  const store = readSession<ScrollStore>(SCROLL_KEY, { byKey: {}, byPath: {} });
  store.byKey[locationKey] = pos;
  store.byPath[path] = pos;
  writeSession(SCROLL_KEY, store);
}

export function getScrollByKey(locationKey: string): ScrollPos | null {
  return readSession<ScrollStore>(SCROLL_KEY, { byKey: {}, byPath: {} }).byKey[locationKey] ?? null;
}

export function getScrollByPath(path: string): ScrollPos | null {
  return readSession<ScrollStore>(SCROLL_KEY, { byKey: {}, byPath: {} }).byPath[path] ?? null;
}

export function saveFocusId(locationKey: string, focusId: string): void {
  const store = readSession<Record<string, string>>(FOCUS_KEY, {});
  store[locationKey] = focusId;
  writeSession(FOCUS_KEY, store);
}

export function getFocusId(locationKey: string): string | null {
  return readSession<Record<string, string>>(FOCUS_KEY, {})[locationKey] ?? null;
}

export function ScrollManager(): null {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isInitialEntry = useRef(true);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 持续记录当前历史条目的滚动位置；离开条目时做最后一次保存
  useEffect(() => {
    const locationKey = location.key;
    const path = location.pathname;
    const save = () =>
      saveScrollPosition(locationKey, path, { x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', save, { passive: true });
    return () => {
      window.removeEventListener('scroll', save);
      save();
    };
  }, [location.key, location.pathname]);

  // 根据导航类型恢复或重置滚动
  useLayoutEffect(() => {
    const state = (location.state ?? {}) as PortalLocationState;
    const isInitial = isInitialEntry.current;
    isInitialEntry.current = false;

    // 「继续学习」：恢复到该路径上次的阅读位置
    if (state.resume) {
      const pos = getScrollByPath(location.pathname);
      if (pos) {
        window.scrollTo(pos.x, pos.y);
        return;
      }
    }
    // 打开抽屉/模态等覆盖层：保持底层页面滚动不动
    if (state.overlay) return;

    if (navigationType === 'POP') {
      // 前进/后退按条目 key 恢复；整页刷新后的首个条目退回按路径恢复
      const pos = getScrollByKey(location.key) ?? (isInitial ? getScrollByPath(location.pathname) : null);
      if (pos) window.scrollTo(pos.x, pos.y);
    } else if (navigationType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [location.key, location.pathname, location.state, navigationType]);

  return null;
}

export function FocusManager(): null {
  const location = useLocation();
  const navigationType = useNavigationType();

  // 记录当前历史条目内最后聚焦的元素（覆盖层内部的焦点不记录，
  // 否则模态打开时的自动聚焦会覆盖掉触发按钮的记录）
  useEffect(() => {
    const locationKey = location.key;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('[data-overlay-root]')) return;
      const focusId = target.dataset?.focusId;
      if (focusId) saveFocusId(locationKey, focusId);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, [location.key]);

  // 前进/后退回到该条目时恢复焦点
  useLayoutEffect(() => {
    if (navigationType !== 'POP') return;
    const focusId = getFocusId(location.key);
    if (!focusId) return;
    const el = document.querySelector<HTMLElement>(`[data-focus-id="${focusId}"]`);
    el?.focus();
  }, [location.key, navigationType]);

  return null;
}
