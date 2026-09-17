import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page not-found">
      <p className="eyebrow">404</p>
      <h1>页面不存在</h1>
      <p>你访问的地址不存在或已调整。</p>
      <Link to="/catalog" replace className="btn primary">
        返回课程目录
      </Link>
    </div>
  );
}
