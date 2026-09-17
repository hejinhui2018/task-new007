import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { scrollStore } from '../lib/scrollStore';
import type { PortalLocationState } from '../types';

/**
 * 全局滚动管理：
 * - 持续把当前历史条目的滚动位置写入 scrollStore（按条目 key 存档）；
 * - POP（前进/后退/刷新）时恢复该条目上次的位置；
 * - PUSH 到新页面时回到顶部；
 * - 打开模态层、仅查询参数变化（如开关测验抽屉）时保持原位；
 * - “继续学习”产生的 PUSH 交给章节页自己定位，这里不干预。
 */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 持续记录当前条目的滚动位置
  useEffect(() => {
    const key = location.key;
    let lastSave = 0;
    let timer = 0;
    const save = () => scrollStore.set(key, window.scrollY);
    const onScroll = () => {
      const now = Date.now();
      if (now - lastSave >= 100) {
        lastSave = now;
        save();
      } else {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          lastSave = Date.now();
          save();
        }, 120);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      save(); // 离开当前条目前兜底保存一次
    };
  }, [location.key]);

  // 根据导航类型决定滚动位置
  useLayoutEffect(() => {
    const state = location.state as PortalLocationState | null;
    const previousPath = previousPathRef.current;
    previousPathRef.current = location.pathname;

    const opensModal = Boolean(state?.background);
    const staysOnSamePage = previousPath === location.pathname;
    if (opensModal || staysOnSamePage) return;

    if (navigationType === 'POP') {
      const saved = scrollStore.get(location.key);
      if (saved != null) {
        window.scrollTo(0, saved);
        return;
      }
    } else if (navigationType === 'PUSH' && state?.resume) {
      return; // 由章节页负责恢复到上次阅读位置
    }
    window.scrollTo(0, 0);
  }, [location, navigationType]);

  return null;
}
