import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './App';
import { seedQuizProgress } from './lib/quizStorage';
import './index.css';

// 内置一份未提交的测验作答，模拟员工上次退出前留下的进度
seedQuizProgress();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
);
