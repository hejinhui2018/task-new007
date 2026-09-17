import { useEffect, useRef, type ReactNode } from 'react';
import { appHasMounted } from '../lib/appLifecycle';

/**
 * 页面主标题。客户端导航发生后把焦点移到标题上（preventScroll，不影响滚动恢复），
 * 让读屏用户能感知页面切换；首次加载不抢焦点。
 */
export function PageHeading({
  children,
  focusKey,
  className,
}: {
  children: ReactNode;
  focusKey: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!appHasMounted()) return;
    ref.current?.focus({ preventScroll: true });
  }, [focusKey]);

  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  );
}
