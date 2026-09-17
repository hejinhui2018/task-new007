const STORAGE_KEY = 'portal:progress';

export interface LastPosition {
  chapterId: string;
  scrollY: number;
}

export interface LearningProgress {
  visited: string[];
  completed: string[];
  lastPosition: LastPosition | null;
}

const EMPTY: LearningProgress = { visited: [], completed: [], lastPosition: null };

/** 每次都从 localStorage 读取，保证刷新、多标签页场景下拿到的是最新值。 */
export function loadProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<LearningProgress>;
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited.filter((v) => typeof v === 'string') : [],
      completed: Array.isArray(parsed.completed)
        ? parsed.completed.filter((v) => typeof v === 'string')
        : [],
      lastPosition:
        parsed.lastPosition && typeof parsed.lastPosition.chapterId === 'string'
          ? { chapterId: parsed.lastPosition.chapterId, scrollY: Number(parsed.lastPosition.scrollY) || 0 }
          : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(progress: LearningProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 存储不可用（隐私模式等）时静默降级，学习进度丢失不阻断阅读
  }
}

export function markVisited(chapterId: string): void {
  const progress = loadProgress();
  if (!progress.visited.includes(chapterId)) {
    save({ ...progress, visited: [...progress.visited, chapterId] });
  }
}

export function markCompleted(chapterId: string): void {
  const progress = loadProgress();
  if (!progress.completed.includes(chapterId)) {
    save({ ...progress, completed: [...progress.completed, chapterId] });
  }
}

export function saveLastPosition(chapterId: string, scrollY: number): void {
  const progress = loadProgress();
  save({ ...progress, lastPosition: { chapterId, scrollY: Math.max(0, Math.round(scrollY)) } });
}

export function getLastPosition(): LastPosition | null {
  return loadProgress().lastPosition;
}
