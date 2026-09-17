import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
  type NavigateFunction,
} from 'react-router-dom';
import AppRoutes from '../src/App';
import { scrollToMock } from './setup';

export { scrollToMock };

export interface NavEntry {
  pathname: string;
  search: string;
  key: string;
  action: string;
}

interface ProbeApi {
  navigate: NavigateFunction | null;
}

/** 记录每一次历史变化（按 key+path+search+action 去重），并暴露 navigate 以模拟前进/后退。 */
function NavigationProbe({ log, api }: { log: NavEntry[]; api: ProbeApi }) {
  const location = useLocation();
  const action = useNavigationType();
  api.navigate = useNavigate();
  const lastSignature = useRef('');
  const signature = `${location.key}|${location.pathname}|${location.search}|${action}`;
  if (lastSignature.current !== signature) {
    lastSignature.current = signature;
    log.push({ pathname: location.pathname, search: location.search, key: location.key, action });
  }
  return null;
}

export function renderApp(initialEntries: string[] = ['/catalog'], initialIndex?: number) {
  const navLog: NavEntry[] = [];
  const api: ProbeApi = { navigate: null };
  const utils = render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <NavigationProbe log={navLog} api={api} />
      <AppRoutes />
    </MemoryRouter>,
  );
  /** 模拟浏览器前进/后退 */
  const go = async (delta: number) => {
    await act(async () => {
      api.navigate!(delta);
    });
  };
  return { ...utils, navLog, go };
}

/** jsdom 的 scrollY 只读，用 getter 覆盖以模拟用户滚动。 */
export function setScrollY(y: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => y,
  });
}
