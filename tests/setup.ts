import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { resetAppLifecycleForTests } from '../src/lib/appLifecycle';

/** 全局 scrollTo 替身：jsdom 未实现滚动，测试中统一换成可断言的 mock。 */
export const scrollToMock = vi.fn();

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetAppLifecycleForTests();
  scrollToMock.mockClear();
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    writable: true,
    value: scrollToMock,
  });
});

afterEach(() => {
  cleanup();
});
