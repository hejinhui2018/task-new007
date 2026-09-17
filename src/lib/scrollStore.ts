const SESSION_KEY = 'portal:scroll-positions';

/**
 * 按 history 条目 key 记录滚动位置。
 * React Router 会把条目的 key 持久化到 history.state，
 * 因此刷新后同一个条目的 key 不变，配合 sessionStorage 即可恢复滚动。
 */
function readAll(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export const scrollStore = {
  get(key: string): number | undefined {
    const value = readAll()[key];
    return typeof value === 'number' ? value : undefined;
  },
  set(key: string, y: number): void {
    const all = readAll();
    all[key] = Math.max(0, Math.round(y));
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(all));
    } catch {
      // 存储不可用时静默降级
    }
  },
};
