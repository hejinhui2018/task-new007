import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { course } from '../data/course';
import { useProgress } from '../hooks/useProgress';
import type { PortalLocationState } from '../types';

/**
 * 测验抽屉：挂在章节页的子路由 /chapter/:chapterId/quiz 上。
 * - 会话内通过「开始测验」打开（PUSH + overlay 标记）：关闭时后退一步；
 * - 深链/刷新直接进入：关闭时 replace 回章节页，不产生多余历史。
 * 未提交的作答实时写入 localStorage，刷新、关闭再打开都不会丢。
 */
export default function QuizDrawer() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, update] = useProgress();

  const quiz = course.quiz;
  const total = quiz.questions.length;
  const answers = progress.quiz.answers;
  const answeredCount = quiz.questions.filter((q) => answers[q.id]).length;
  const submitted = progress.quiz.status === 'submitted';
  const score = progress.quiz.score ?? 0;
  const passed = score >= quiz.passScore;

  const close = useCallback(() => {
    const openedInSession = Boolean((location.state as PortalLocationState | null)?.overlay);
    if (openedInSession) {
      navigate(-1);
    } else {
      navigate(`/chapter/${chapterId}`, { replace: true });
    }
  }, [chapterId, location.state, navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  // 关闭后把焦点还给触发按钮（覆盖深链关闭等非 POP 场景）
  useEffect(() => {
    const state = location.state as PortalLocationState | null;
    return () => {
      if (state?.returnFocusId) {
        document
          .querySelector<HTMLElement>(`[data-focus-id="${state.returnFocusId}"]`)
          ?.focus();
      }
    };
  }, [location.state]);

  const select = (questionId: string, optionId: string) =>
    update((p) => {
      p.quiz.status = 'draft';
      p.quiz.answers[questionId] = optionId;
    });

  const submit = () =>
    update((p) => {
      const correct = quiz.questions.filter((q) => p.quiz.answers[q.id] === q.correctOptionId).length;
      p.quiz.status = 'submitted';
      p.quiz.score = Math.round((correct / total) * 100);
    });

  const retry = () =>
    update((p) => {
      p.quiz = { status: 'draft', answers: {} };
    });

  return (
    <div className="drawer-root" data-overlay-root data-testid="quiz-drawer">
      <div className="drawer-overlay" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={quiz.title}>
        <header className="drawer-header">
          <div>
            <span className="tag tag-violet">课程测验</span>
            <h2>{quiz.title}</h2>
            <p className="drawer-hint">
              {submitted ? '已提交' : `草稿已自动保存 · 已答 ${answeredCount}/${total}`}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="关闭测验"
            data-focus-id="close-quiz"
            autoFocus
            onClick={close}
          >
            ×
          </button>
        </header>

        <div className="drawer-body">
          {!submitted ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {quiz.questions.map((question, qi) => (
                <fieldset className="question" key={question.id}>
                  <legend>
                    {qi + 1}. {question.text}
                  </legend>
                  {question.options.map((option) => {
                    const checked = answers[question.id] === option.id;
                    return (
                      <label className={`option${checked ? ' selected' : ''}`} key={option.id}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={checked}
                          onChange={() => select(question.id, option.id)}
                        />
                        <span>{option.text}</span>
                      </label>
                    );
                  })}
                </fieldset>
              ))}
            </form>
          ) : (
            <div className="quiz-result">
              <div className={`score ${passed ? 'pass' : 'fail'}`} data-testid="quiz-score">
                {score}
                <small>分</small>
              </div>
              <p className="result-line">
                {passed ? '恭喜，已通过结业测验' : `未通过（${quiz.passScore} 分及格），可以重新作答`}
              </p>
              {quiz.questions.map((question, qi) => {
                const correct = answers[question.id] === question.correctOptionId;
                return (
                  <div className="result-item" key={question.id}>
                    <p>
                      <span className={correct ? 'ok' : 'ng'} aria-hidden="true">
                        {correct ? '✓' : '✗'}
                      </span>{' '}
                      {qi + 1}. {question.text}
                    </p>
                    <p className="explanation">{question.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="drawer-footer">
          {!submitted ? (
            <>
              <span className="footer-hint">
                {answeredCount < total ? `还有 ${total - answeredCount} 题未作答` : '已全部作答，可以提交'}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                data-focus-id="submit-quiz"
                disabled={answeredCount < total}
                onClick={submit}
              >
                提交答案
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                data-focus-id="retry-quiz"
                onClick={retry}
              >
                重新作答
              </button>
              <button type="button" className="btn btn-primary" onClick={close}>
                继续学习
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
