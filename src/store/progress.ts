const STORAGE_KEY = 'corp-portal:progress:v1';

export interface QuizProgress {
  status: 'draft' | 'submitted';
  /** questionId -> optionId */
  answers: Record<string, string>;
  score?: number;
}

export interface Progress {
  completedChapters: string[];
  lastVisitedChapterId: string | null;
  quiz: QuizProgress;
}

/**
 * 内置的初始进度：第一章已完成、上次学到第二章，
 * 测验带两份未提交的草稿答案（q1、q3）。
 */
export const defaultProgress: Progress = {
  completedChapters: ['ch1'],
  lastVisitedChapterId: 'ch2',
  quiz: {
    status: 'draft',
    answers: { q1: 'b', q3: 'c' },
  },
};

function cloneDefault(): Progress {
  return {
    completedChapters: [...defaultProgress.completedChapters],
    lastVisitedChapterId: defaultProgress.lastVisitedChapterId,
    quiz: { ...defaultProgress.quiz, answers: { ...defaultProgress.quiz.answers } },
  };
}

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const base = cloneDefault();
    return {
      completedChapters: parsed.completedChapters ?? base.completedChapters,
      lastVisitedChapterId: parsed.lastVisitedChapterId ?? base.lastVisitedChapterId,
      quiz: { ...base.quiz, ...parsed.quiz, answers: { ...base.quiz.answers, ...parsed.quiz?.answers } },
    };
  } catch {
    return cloneDefault();
  }
}

export function saveProgress(progress: Progress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 存储不可用时静默降级（如隐私模式）
  }
}

/** 读取最新进度、应用变更、写回存储，并返回写入后的新对象。 */
export function updateProgress(mutate: (progress: Progress) => void): Progress {
  const progress = loadProgress();
  mutate(progress);
  saveProgress(progress);
  return progress;
}
