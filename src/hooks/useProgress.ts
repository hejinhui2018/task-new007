import { useCallback, useState } from 'react';
import type { Progress } from '../store/progress';
import { loadProgress, updateProgress } from '../store/progress';

/**
 * 组件级的进度读取/写入。写入时总是基于存储中的最新值合并，
 * 因此多个组件同时挂载（章节页 + 测验抽屉）也不会互相覆盖。
 */
export function useProgress(): [Progress, (mutate: (progress: Progress) => void) => void] {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const update = useCallback((mutate: (progress: Progress) => void) => {
    setProgress(updateProgress(mutate));
  }, []);
  return [progress, update];
}
