import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import CatalogPage from './pages/CatalogPage';
import ChapterPage from './pages/ChapterPage';
import ChapterModal from './pages/ChapterModal';
import QuizDrawer from './pages/QuizDrawer';
import { FocusManager, ScrollManager } from './restoration';
import type { PortalLocationState } from './types';

export default function App() {
  const location = useLocation();
  const background = (location.state as PortalLocationState | null)?.backgroundLocation;

  return (
    <AppLayout>
      <ScrollManager />
      <FocusManager />
      {/* 背景层：模态打开时仍渲染背后的页面（目录），保持其滚动与挂载状态 */}
      <Routes location={background ?? location}>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/chapter/:chapterId" element={<ChapterPage />}>
          <Route path="quiz" element={<QuizDrawer />} />
        </Route>
        {/* 未知地址：replace 回目录，不让失效地址留在历史栈里 */}
        <Route
          path="*"
          element={<Navigate to="/" replace state={{ notice: '您访问的页面不存在或已移动，已为你返回课程目录' }} />}
        />
      </Routes>
      {/* 前景层：仅当通过目录页以模态方式打开章节时渲染 */}
      {background && (
        <Routes>
          <Route path="/chapter/:chapterId" element={<ChapterModal />} />
        </Routes>
      )}
    </AppLayout>
  );
}
