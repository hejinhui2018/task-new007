import { useEffect } from 'react';
import { Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import ChapterSections from '../components/ChapterSections';
import type { Chapter } from '../data/course';
import { course, getChapter, getChapterIndex } from '../data/course';
import { useProgress } from '../hooks/useProgress';

export default function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);

  // 章节不存在：replace 回目录并提示，失效地址不留在历史栈中
  if (!chapter) {
    return (
      <Navigate to="/" replace state={{ notice: '章节不存在或已下线，已为你返回课程目录' }} />
    );
  }
  return <ChapterView chapter={chapter} />;
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  const navigate = useNavigate();
  const [progress, update] = useProgress();
  const index = getChapterIndex(chapter.id);
  const prev = course.chapters[index - 1];
  const next = course.chapters[index + 1];
  const completed = progress.completedChapters.includes(chapter.id);

  // 记录“上次学到”，供目录页「继续学习」使用
  useEffect(() => {
    update((p) => {
      p.lastVisitedChapterId = chapter.id;
    });
  }, [chapter.id, update]);

  const markCompleted = () =>
    update((p) => {
      if (!p.completedChapters.includes(chapter.id)) {
        p.completedChapters.push(chapter.id);
      }
    });

  return (
    <div className="container page-chapter">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/">课程目录</Link>
        <span aria-hidden="true"> / </span>
        <span>
          第 {index + 1} 章 · {chapter.title}
        </span>
      </nav>

      <header className="chapter-header">
        <div>
          <span className="tag">第 {index + 1} 章 · 讲义</span>
          <h1>{chapter.title}</h1>
          <div className="chapter-header-meta">
            约 {chapter.durationMinutes} 分钟 · {chapter.sections.length} 个小节
            {completed && <span className="pill pill-green">已完成</span>}
          </div>
        </div>
        <div className="chapter-header-actions">
          <button
            type="button"
            className="btn btn-ghost"
            data-focus-id="mark-complete"
            onClick={markCompleted}
            disabled={completed}
          >
            {completed ? '✓ 已完成' : '标记为已完成'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-focus-id="open-quiz"
            onClick={() =>
              navigate('quiz', { state: { overlay: true, returnFocusId: 'open-quiz' } })
            }
          >
            开始测验
          </button>
        </div>
      </header>

      <ChapterSections chapter={chapter} />

      <footer className="chapter-footer-nav">
        {prev ? (
          <Link to={`/chapter/${prev.id}`} data-focus-id="prev-chapter" className="chapter-nav-link">
            ← 上一章 · {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <Link to="/" data-focus-id="back-catalog" className="chapter-nav-link back">
          返回目录
        </Link>
        {next ? (
          <Link to={`/chapter/${next.id}`} data-focus-id="next-chapter" className="chapter-nav-link">
            下一章 · {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </footer>

      {/* 测验抽屉（子路由 /chapter/:chapterId/quiz） */}
      <Outlet />
    </div>
  );
}
