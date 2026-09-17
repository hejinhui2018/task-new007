import { course } from '../data/course';

const STORAGE_KEY = 'portal:quiz';

export interface QuizState {
  /** questionId -> 选项下标；未提交前也会实时落盘，刷新后继续作答 */
  answers: Record<string, number>;
  submitted: boolean;
  score: number | null;
}

const EMPTY: QuizState = { answers: {}, submitted: false, score: null };

export function loadQuizState(): QuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, answers: {} };
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    return {
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      submitted: Boolean(parsed.submitted),
      score: typeof parsed.score === 'number' ? parsed.score : null,
    };
  } catch {
    return { ...EMPTY, answers: {} };
  }
}

export function saveQuizState(state: QuizState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 存储不可用时静默降级
  }
}

/**
 * 首次访问时内置一份“未提交”的作答记录，
 * 模拟员工上次退出前留下的答题进度（断点续作的演示数据）。
 * 已有任何测验记录时不覆盖。
 */
export function seedQuizProgress(): void {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch {
    return;
  }
  const first = course.quiz.questions[0];
  if (!first) return;
  saveQuizState({ answers: { [first.id]: 1 }, submitted: false, score: null });
}
