import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { course } from '../data/course';
import { useProgress } from '../hooks/useProgress';
import type { PortalLocationState } from '../types';

export default function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const notice = (location.state as PortalLocationState | null)?.notice ?? null;
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  useEffect(() => {
    setNoticeDismissed(false);
  }, [notice]);

  const [progress] = useProgress();
  const completed = new Set(progress.completedChapters);
  const totalChapters = course.chapters.length;
  const percent = Math.round((completed.size / totalChapters) * 100);
  const totalMinutes = course.chapters.reduce((sum, ch) => sum + ch.durationMinutes, 0);

  const resumeChapter =
    course.chapters.find((c) => c.id === progress.lastVisitedChapterId) ?? course.chapters[0];
  const resumeIndex = course.chapters.indexOf(resumeChapter);

  const totalQuestions = course.quiz.questions.length;
  const answeredCount = Object.keys(progress.quiz.answers).length;
  const quizSubmitted = progress.quiz.status === 'submitted';

  return (
    <div className="container page-catalog">
      {notice && !noticeDismissed && (
        <div className="notice-banner" role="alert">
          <span>{notice}</span>
          <button type="button" aria-label="关闭提示" onClick={() => setNoticeDismissed(true)}>
            ×
          </button>
        </div>
      )}

      <section className="hero">
        <div className="hero-text">
          <span className="tag tag-light">{course.subtitle}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="hero-meta">
            <span>{totalChapters} 个章节</span>
            <span>约 {totalMinutes} 分钟</span>
            <span>结业测验 {totalQuestions} 题</span>
          </div>
        </div>
        <div className="hero-side">
          <div className="progress-card">
            <div className="progress-line">
              <span>学习进度</span>
              <strong>{percent}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <p className="progress-detail">
              已完成 {completed.size}/{totalChapters} 章
              {quizSubmitted ? ` · 测验得分 ${progress.quiz.score}` : ''}
            </p>
            <button
              type="button"
              className="btn btn-light"
              data-focus-id="resume-learning"
              onClick={() =>
                navigate(`/chapter/${resumeChapter.id}`, { state: { resume: true } })
              }
            >
              继续学习 · 第 {resumeIndex + 1} 章
            </button>
          </div>
        </div>
      </section>

      <section aria-label="章节列表">
        <h2 className="section-title">课程章节</h2>
        <div className="chapter-list">
          {course.chapters.map((chapter, index) => {
            const isCompleted = completed.has(chapter.id);
            const isCurrent = !isCompleted && chapter.id === progress.lastVisitedChapterId;
            return (
              <article className="chapter-row" data-testid={`chapter-row-${chapter.id}`} key={chapter.id}>
                <div className={`chapter-index${isCompleted ? ' done' : ''}`} aria-hidden="true">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="chapter-main">
                  <div className="chapter-title-line">
                    <h3>{chapter.title}</h3>
                    {isCompleted ? (
                      <span className="pill pill-green">已完成</span>
                    ) : isCurrent ? (
                      <span className="pill pill-amber">进行中</span>
                    ) : (
                      <span className="pill pill-gray">未开始</span>
                    )}
                  </div>
                  <p>{chapter.summary}</p>
                  <div className="chapter-meta">
                    约 {chapter.durationMinutes} 分钟 · {chapter.sections.length} 个小节 · 含讲义
                  </div>
                </div>
                <div className="chapter-actions">
                  <Link
                    className="btn btn-primary"
                    to={`/chapter/${chapter.id}`}
                    data-focus-id={`enter-${chapter.id}`}
                  >
                    {isCompleted ? '重新学习' : '进入章节'}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    data-focus-id={`preview-${chapter.id}`}
                    onClick={() =>
                      navigate(`/chapter/${chapter.id}`, {
                        state: { backgroundLocation: location, overlay: true },
                      })
                    }
                  >
                    预览
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-label="结业测验">
        <h2 className="section-title">结业测验</h2>
        <article className="quiz-card" data-testid="quiz-card">
          <div className="quiz-icon" aria-hidden="true">
            ✎
          </div>
          <div className="chapter-main">
            <div className="chapter-title-line">
              <h3>{course.quiz.title}</h3>
              {quizSubmitted ? (
                <span className="pill pill-green">已完成 · {progress.quiz.score} 分</span>
              ) : answeredCount > 0 ? (
                <span className="pill pill-violet">
                  草稿进行中 · 已答 {answeredCount}/{totalQuestions}
                </span>
              ) : (
                <span className="pill pill-gray">未开始</span>
              )}
            </div>
            <p>{course.quiz.description}</p>
          </div>
          <div className="chapter-actions">
            <button
              type="button"
              className="btn btn-primary"
              data-focus-id="enter-quiz"
              onClick={() =>
                navigate(`/chapter/${resumeChapter.id}/quiz`, {
                  state: { overlay: true, resume: true, returnFocusId: 'enter-quiz' },
                })
              }
            >
              {quizSubmitted ? '查看结果' : answeredCount > 0 ? '继续作答' : '进入测验'}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
