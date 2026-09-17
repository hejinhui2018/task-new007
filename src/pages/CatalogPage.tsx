import { Link, useLocation, useNavigate } from 'react-router-dom';
import { course, getChapter } from '../data/course';
import { loadProgress } from '../lib/progress';
import { loadQuizState } from '../lib/quizStorage';
import { focusMemory } from '../lib/focusMemory';
import { useQuizDrawer } from '../hooks/useQuizDrawer';
import { useToast } from '../components/Toast';
import { PageHeading } from '../components/PageHeading';
import { QuizDrawer } from '../components/QuizDrawer';

export function CatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const quiz = useQuizDrawer();

  const progress = loadProgress();
  const quizState = loadQuizState();
  const totalChapters = course.chapters.length;
  const completedCount = course.chapters.filter((c) => progress.completed.includes(c.id)).length;
  const percent = Math.round((completedCount / totalChapters) * 100);

  const last = progress.lastPosition;
  const lastChapter = last ? getChapter(last.chapterId) : null;
  const resumeLabel = lastChapter
    ? `继续学习：${lastChapter.title}`
    : last
      ? '继续学习（上次进度）'
      : '开始学习';

  /**
   * 继续学习 = 受守卫的导航：
   * 上次进度指向的章节已不存在时，只提示错误、不发起导航，
   * 失败导航不会在历史栈里留下垃圾条目。
   */
  const resume = () => {
    if (!last || !lastChapter) {
      toast.error('无法继续学习：上次的学习内容已下线或链接已失效。');
      return;
    }
    navigate(`/chapters/${lastChapter.id}`, { state: { resume: true } });
  };

  const answeredCount = course.quiz.questions.filter((q) => quizState.answers[q.id] != null).length;
  const quizStatus = quizState.submitted
    ? `已完成 · 得分 ${quizState.score}/${course.quiz.questions.length}`
    : answeredCount > 0
      ? `进行中 · 已答 ${answeredCount}/${course.quiz.questions.length}（未提交）`
      : '未开始';

  return (
    <div className="page catalog-page">
      <section className="hero">
        <p className="eyebrow eyebrow-light">{course.audience}</p>
        <PageHeading focusKey="catalog" className="hero-title">
          {course.title}
        </PageHeading>
        <p className="hero-description">{course.description}</p>
        <div className="hero-progress">
          <div className="hero-progress-text">
            <span>
              已完成 {completedCount}/{totalChapters} 章
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="课程完成度"
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-light" onClick={resume}>
            {resumeLabel}
          </button>
        </div>
      </section>

      <section aria-labelledby="chapter-list-title">
        <h2 id="chapter-list-title" className="section-title">
          课程章节
        </h2>
        <div className="chapter-list">
          {course.chapters.map((chapter, index) => {
            const status = progress.completed.includes(chapter.id)
              ? { label: '已完成', className: 'badge-success' }
              : progress.visited.includes(chapter.id)
                ? { label: '进行中', className: 'badge-warning' }
                : { label: '未开始', className: 'badge-muted' };
            return (
              <article className="chapter-card" key={chapter.id}>
                <div className="chapter-card-order" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="chapter-card-body">
                  <div className="chapter-card-title-row">
                    <h3>{chapter.title}</h3>
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="chapter-card-summary">{chapter.summary}</p>
                  <p className="chapter-card-meta">约 {chapter.minutes} 分钟</p>
                  <div className="chapter-card-actions">
                    <Link
                      className="btn primary"
                      to={`/chapters/${chapter.id}`}
                      aria-label={`进入章节：${chapter.title}`}
                    >
                      进入章节
                    </Link>
                    <button
                      type="button"
                      className="btn secondary"
                      aria-label={`预览章节：${chapter.title}`}
                      onClick={(event) => {
                        focusMemory.push(event.currentTarget);
                        navigate(`/chapters/${chapter.id}`, { state: { background: location } });
                      }}
                    >
                      快速预览
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="quiz-card-title">
        <div className="quiz-card">
          <div>
            <p className="eyebrow">随堂测验</p>
            <h2 id="quiz-card-title">{course.quiz.title}</h2>
            <p className="quiz-card-meta">
              共 {course.quiz.questions.length} 题 · {quizStatus}
            </p>
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={(event) => {
              focusMemory.push(event.currentTarget);
              quiz.open();
            }}
          >
            打开测验
          </button>
        </div>
      </section>

      {quiz.isOpen && <QuizDrawer onClose={quiz.close} />}
    </div>
  );
}
