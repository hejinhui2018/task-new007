import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" data-focus-id="brand-home">
            <span className="brand-logo" aria-hidden="true">
              航
            </span>
            <span className="brand-name">
              领航学院
              <small>企业培训门户</small>
            </span>
          </Link>
          <nav className="site-nav" aria-label="主导航">
            <Link to="/" data-focus-id="nav-catalog">
              课程目录
            </Link>
            <span className="nav-placeholder">学习记录</span>
            <span className="nav-placeholder">证书中心</span>
          </nav>
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">
              张
            </span>
            <span className="user-name">张伟 · 销售一部</span>
          </div>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">© 2026 领航学院 · 企业培训门户 · 仅供内部学习使用</footer>
    </div>
  );
}
