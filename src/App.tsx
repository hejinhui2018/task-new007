import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { markAppMounted } from './lib/appLifecycle';
import { ScrollManager } from './components/ScrollManager';
import { ToastProvider } from './components/Toast';
import { ChapterModal } from './components/ChapterModal';
import { CatalogPage } from './pages/CatalogPage';
import { ChapterPage } from './pages/ChapterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import type { PortalLocationState } from './types';

/**
 * 路由结构：
 * - /catalog           课程目录
 * - /chapters/:id      章节页（直接访问 / 刷新时的形态）
 * - /chapters/:id      当导航 state 带 background 时，同一地址以模态层盖在背景页上
 * - ?quiz=open         任意页面上的测验抽屉开关
 *
 * 模态状态、抽屉状态都在 URL / history.state 上，刷新与前进后退天然可恢复。
 */
export default function AppRoutes() {
  const location = useLocation();
  const state = location.state as PortalLocationState | null;
  const background = state?.background;

  useEffect(() => {
    markAppMounted();
  }, []);

  return (
    <ToastProvider>
      <ScrollManager />
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-inner">
            <Link to="/catalog" className="brand">
              <span className="brand-logo" aria-hidden="true">
                学
              </span>
              企业培训门户
            </Link>
            <nav className="app-nav" aria-label="主导航">
              <Link to="/catalog">课程目录</Link>
            </nav>
            <div className="user-chip">
              <span className="user-avatar" aria-hidden="true">
                张
              </span>
              <span className="user-name">张同学 · 市场部</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <Routes location={background ?? location}>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/chapters/:chapterId" element={<ChapterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="app-footer">企业培训门户 · 学习数据保存在本地浏览器中</footer>
      </div>

      {background && (
        <Routes>
          <Route path="/chapters/:chapterId" element={<ChapterModal />} />
          <Route path="*" element={null} />
        </Routes>
      )}
    </ToastProvider>
  );
}
