import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * 测验抽屉的开关状态放在 URL 上（?quiz=open），因此：
 * - 刷新后抽屉保持打开；
 * - 打开抽屉是一次 PUSH，浏览器后退即可关闭；
 * - 点“关闭”用 REPLACE 抹掉抽屉条目，后退不会重新弹出抽屉。
 */
export function useQuizDrawer() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = searchParams.get('quiz') === 'open';

  const open = () => {
    // 保留 location.state：模态层里打开抽屉时不能丢掉背景页信息
    navigate(`${location.pathname}?quiz=open`, { state: location.state });
  };

  const close = () => {
    navigate(location.pathname, { state: location.state, replace: true });
  };

  return { isOpen, open, close };
}
