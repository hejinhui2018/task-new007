import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom 未实现 window.scrollTo，统一替换为空实现；
// 需要断言的测试再用 vi.spyOn(window, 'scrollTo') 包装。
Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  writable: true,
  value: () => {},
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.body.style.overflow = '';
});
