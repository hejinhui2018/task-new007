import { useCallback, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import ChapterSections from '../components/ChapterSections';
import { getChapter, getChapterIndex } from '../data/course';

/**
 * 章节预览模态层：从目录点「预览」时覆盖在目录之上。
 * 直接访问 /chapter/:id（深链、刷新后无模态状态）不会走到这里。
 */
export default function ChapterModal() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const index = chapter ? getChapterIndex(chapter.id) : -1;

  // 模态只能通过会话内导航打开（state 中带 backgroundLocation），
  // 因此关闭时后退一步即可回到背景页
  const close = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  // 打开期间锁定背景滚动
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!chapter) {
    return (
      <Navigate to="/" replace state={{ notice: '章节不存在或已下线，已为你返回课程目录' }} />
    );
  }

  return (
    <div className="modal-root" data-overlay-root>
      <div className="modal-overlay" onClick={close} />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-modal-title"
        data-testid="chapter-modal"
      >
        <header className="modal-header">
          <div>
            <span className="tag">第 {index + 1} 章 · 快速预览</span>
            <h2 id="chapter-modal-title">{chapter.title}</h2>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="关闭预览"
            data-focus-id="close-modal"
            autoFocus
            onClick={close}
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          <ChapterSections chapter={chapter} />
        </div>
        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={close}>
            关闭
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-focus-id="open-full-chapter"
            onClick={() => navigate(`/chapter/${chapter.id}`)}
          >
            打开完整章节
          </button>
        </footer>
      </div>
    </div>
  );
}
