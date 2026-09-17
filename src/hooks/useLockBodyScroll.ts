import { useEffect } from 'react';

/** 浮层打开期间锁定 body 滚动，关闭后恢复原值。 */
export function useLockBodyScroll(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
