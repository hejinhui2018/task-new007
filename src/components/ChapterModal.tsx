import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getChapter, type Chapter } from '../data/course';
import { focusMemory } from '../lib/focusMemory';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useQuizDrawer } from '../hooks/useQuizDrawer';
import { ChapterSections } from './ChapterSections';
import { QuizDrawer } from './QuizDrawer';

/** 章节模态层：仅当导航 state 中带有 background 时渲染（见 App.tsx）。 */
export function ChapterModal() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);
  if (!chapter) return <MissingChapterModal chapterId={chapterId} />;
  return <ChapterModalView chapter={chapter} />;
}

function ChapterModalView({ chapter }: { chapter: Chapter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = useQuizDrawer();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const quizOpenRef = useRef(quiz.isOpen);
  quizOpenRef.current = quiz.isOpen;
  useLockBodyScroll(true);

  const closeModal = () => navigate(-1);

  // 打开时聚焦关闭按钮；卸载时把焦点还给触发元素
  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
    return () => {
      focusMemory.pop()?.focus({ preventScroll: true });
    };
  }, []);

  // Esc 关闭；抽屉打开时让抽屉先处理
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !quizOpenRef.current) closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 简单的焦点圈定：Tab 在对话框内循环
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => dialog.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !quizOpenRef.current) closeModal();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-modal-title"
        ref={dialogRef}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">章节预览</p>
            <h2 id="chapter-modal-title">{chapter.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="icon-button"
            onClick={closeModal}
            aria-label="关闭预览"
          >
            ✕
          </button>
        </header>
        <div className="modal-body">
          <ChapterSections chapter={chapter} />
        </div>
        <footer className="modal-footer">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(location.pathname, { replace: true })}
          >
            在完整页面中打开
          </button>
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
        </footer>
      </div>
      {quiz.isOpen && <QuizDrawer onClose={quiz.close} />}
    </div>
  );
}

function MissingChapterModal({ chapterId }: { chapterId?: string }) {
  const navigate = useNavigate();
  return (
    <div className="modal-overlay">
      <div className="modal modal-compact" role="dialog" aria-modal="true" aria-labelledby="missing-modal-title">
        <header className="modal-header">
          <h2 id="missing-modal-title">找不到章节</h2>
        </header>
        <div className="modal-body">
          <p>章节「{chapterId}」不存在或已下线。</p>
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn primary" onClick={() => navigate(-1)}>
            关闭
          </button>
        </footer>
      </div>
    </div>
  );
}
