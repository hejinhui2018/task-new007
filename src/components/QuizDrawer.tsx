import { useEffect, useRef, useState } from 'react';
import { course } from '../data/course';
import { loadQuizState, saveQuizState, type QuizState } from '../lib/quizStorage';
import { focusMemory } from '../lib/focusMemory';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

const EMPTY_QUIZ: QuizState = { answers: {}, submitted: false, score: null };

/**
 * 测验抽屉。答案每次选择都会写入 localStorage，
 * 未提交就刷新/离开也能接着答（断点续作）。
 */
export function QuizDrawer({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<QuizState>(() => loadQuizState());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useLockBodyScroll(true);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // 关闭后把焦点还给“打开测验”按钮
      focusMemory.pop()?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (next: QuizState) => {
    setState(next);
    saveQuizState(next);
  };

  const choose = (questionId: string, choiceIndex: number) => {
    if (state.submitted) return;
    update({ ...state, answers: { ...state.answers, [questionId]: choiceIndex } });
  };

  const submit = () => {
    const score = course.quiz.questions.filter((q) => state.answers[q.id] === q.answerIndex).length;
    update({ ...state, submitted: true, score });
  };

  const restart = () => {
    update({ answers: {}, submitted: false, score: null });
  };

  const total = course.quiz.questions.length;
  const answeredCount = course.quiz.questions.filter((q) => state.answers[q.id] != null).length;
  const allAnswered = answeredCount === total;

  return (
    <div
      className="drawer-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="quiz-drawer-title">
        <header className="drawer-header">
          <div>
            <p className="eyebrow">随堂测验</p>
            <h2 id="quiz-drawer-title">{course.quiz.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="关闭测验"
          >
            ✕
          </button>
        </header>

        <div className="drawer-body">
          {state.submitted ? (
            <div className="quiz-result" role="alert">
              <span className="quiz-result-label">本次得分</span>
              <span className="quiz-result-score">
                {state.score} / {total}
              </span>
              <span className="quiz-result-hint">
                {state.score === total ? '全部答对，恭喜完成本课程！' : '可以查看解析后重新作答。'}
              </span>
            </div>
          ) : (
            <p className="quiz-progress">
              已答 {answeredCount}/{total} 题
              {answeredCount > 0 && ' · 答案已自动保存，可随时离开后继续'}
            </p>
          )}

          <ol className="quiz-questions">
            {course.quiz.questions.map((question, questionIndex) => (
              <li key={question.id}>
                <fieldset disabled={state.submitted}>
                  <legend>
                    {questionIndex + 1}. {question.prompt}
                  </legend>
                  {question.choices.map((choice, choiceIndex) => {
                    const checked = state.answers[question.id] === choiceIndex;
                    const isCorrect = question.answerIndex === choiceIndex;
                    const className = state.submitted
                      ? isCorrect
                        ? 'choice choice-correct'
                        : checked
                          ? 'choice choice-wrong'
                          : 'choice'
                      : 'choice';
                    return (
                      <label key={choiceIndex} className={className}>
                        <input
                          type="radio"
                          name={question.id}
                          checked={checked}
                          onChange={() => choose(question.id, choiceIndex)}
                        />
                        <span>{choice}</span>
                      </label>
                    );
                  })}
                  {state.submitted && <p className="quiz-explanation">解析：{question.explanation}</p>}
                </fieldset>
              </li>
            ))}
          </ol>
        </div>

        <footer className="drawer-footer">
          {state.submitted ? (
            <button type="button" className="btn secondary" onClick={restart}>
              重新测验
            </button>
          ) : (
            <button
              type="button"
              className="btn primary"
              onClick={submit}
              disabled={!allAnswered}
              title={allAnswered ? undefined : '答完全部题目后才能提交'}
            >
              提交测验
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}
