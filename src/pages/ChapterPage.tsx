import { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { course, getAdjacentChapters, getChapter, type Chapter } from '../data/course';
import { getLastPosition, markCompleted, markVisited, saveLastPosition } from '../lib/progress';
import { focusMemory } from '../lib/focusMemory';
import { useQuizDrawer } from '../hooks/useQuizDrawer';
import { useToast } from '../components/Toast';
import { PageHeading } from '../components/PageHeading';
import { ChapterSections } from '../components/ChapterSections';
import { QuizDrawer } from '../components/QuizDrawer';
import type { PortalLocationState } from '../types';

export function ChapterPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);
  if (!chapter) return <ChapterNotFound chapterId={chapterId} />;
  return <ChapterView chapter={chapter} />;
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const quiz = useQuizDrawer();
  const toast = useToast();
  const { prev, next } = getAdjacentChapters(chapter.id);

  // “继续学习”进入时，恢复到上次阅读位置（ScrollManager 对此类导航不干预）
  useLayoutEffect(() => {
    const state = location.state as PortalLocationState | null;
    console.log('[debug] ChapterView layout effect', navigationType, JSON.stringify(state), getLastPosition()?.scrollY);
    if (navigationType === 'PUSH' && state?.resume) {
      window.scrollTo(0, getLastPosition()?.scrollY ?? 0);
    }
  }, [chapter.id, location.state, navigationType]);

  // 记录学习进度与上次阅读位置，供目录页“继续学习”使用
  useEffect(() => {
    markVisited(chapter.id);
    saveLastPosition(chapter.id, window.scrollY);
    let lastSave = 0;
    let timer = 0;
    const save = () => saveLastPosition(chapter.id, window.scrollY);
    const onScroll = () => {
      const now = Date.now();
      if (now - lastSave >= 200) {
        lastSave = now;
        save();
      } else {
        window.clearTimeout(timer);
        timer = window.setTimeout(save, 220);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      save();
    };
  }, [chapter.id]);

  const completeAndContinue = () => {
    markCompleted(chapter.id);
    toast.success(`已完成「${chapter.title}」`);
    navigate(next ? `/chapters/${next.id}` : '/catalog');
  };

  return (
    <div className="page chapter-page">
      <nav className="breadcrumb" aria-label="面包屑">
        <Link to="/catalog">课程目录</Link>
        <span aria-hidden="true">/</span>
        <span>{chapter.title}</span>
      </nav>

      <PageHeading focusKey={chapter.id} className="chapter-title">
        {chapter.title}
      </PageHeading>
      <p className="chapter-meta">
        约 {chapter.minutes} 分钟 · {course.title}
      </p>

      <article className="chapter-content">
        <ChapterSections chapter={chapter} />
      </article>

      <footer className="chapter-footer">
        <div className="chapter-pager">
          {prev ? (
            <Link className="btn ghost" to={`/chapters/${prev.id}`}>
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="btn ghost" to={`/chapters/${next.id}`}>
              {next.title} →
            </Link>
          ) : (
            <Link className="btn ghost" to="/catalog">
              返回目录
            </Link>
          )}
        </div>
        <div className="chapter-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={(event) => {
              focusMemory.push(event.currentTarget);
              quiz.open();
            }}
          >
            打开测验
          </button>
          <button type="button" className="btn primary" onClick={completeAndContinue}>
            {next ? '完成本章，继续下一章' : '完成本章，返回目录'}
          </button>
        </div>
      </footer>

      {quiz.isOpen && <QuizDrawer onClose={quiz.close} />}
    </div>
  );
}

function ChapterNotFound({ chapterId }: { chapterId?: string }) {
  return (
    <div className="page not-found">
      <p className="eyebrow">404</p>
      <h1>找不到章节</h1>
      <p>章节「{chapterId}」不存在或已下线，链接可能已失效。</p>
      {/* replace：坏地址不留在历史栈里，后退不会回到这个错误页 */}
      <Link to="/catalog" replace className="btn primary">
        返回课程目录
      </Link>
    </div>
  );
}
