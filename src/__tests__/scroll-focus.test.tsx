import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { renderApp } from '../test/renderApp';

function setScroll(x: number, y: number) {
  Object.defineProperty(window, 'scrollX', { configurable: true, value: x });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  fireEvent.scroll(window);
}

describe('滚动位置恢复', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('前进/后退时按历史条目恢复各自的滚动位置', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.mocked(window.scrollTo);
    const { probe } = renderApp(['/']);

    // 目录滚动到 120
    setScroll(0, 120);

    // 进入章节：PUSH 回到顶部
    await user.click(
      within(screen.getByTestId('chapter-row-ch2')).getByRole('link', { name: '进入章节' }),
    );
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    // 章节阅读到一半（640），点击「返回目录」（PUSH 回到顶部）
    setScroll(0, 640);
    await user.click(screen.getByRole('link', { name: '返回目录' }));
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    // 后退：恢复章节的阅读位置 640
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch2');
    expect(scrollTo).toHaveBeenLastCalledWith(0, 640);

    // 再后退：恢复目录的滚动位置 120
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/');
    expect(scrollTo).toHaveBeenLastCalledWith(0, 120);
  });

  it('整页刷新后恢复章节阅读位置', async () => {
    window.history.replaceState(null, '', '/');
    const scrollTo = vi.mocked(window.scrollTo);
    const user = userEvent.setup();

    const first = render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>,
    );
    await user.click(
      within(screen.getByTestId('chapter-row-ch2')).getByRole('link', { name: '进入章节' }),
    );
    setScroll(0, 480);
    scrollTo.mockClear();

    // 模拟刷新：卸载整个应用，URL 与 history.state 保留，重新挂载
    first.unmount();
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 480);
  });
});

describe('焦点恢复', () => {
  it('后退时焦点回到之前聚焦的元素', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    // 点击会先聚焦链接，随后跳转
    await user.click(
      within(screen.getByTestId('chapter-row-ch3')).getByRole('link', { name: '进入章节' }),
    );
    expect(probe.location?.pathname).toBe('/chapter/ch3');

    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/');
    expect((document.activeElement as HTMLElement | null)?.dataset.focusId).toBe('enter-ch3');
  });

  it('模态打开时焦点进入对话框，关闭后焦点回到触发按钮', async () => {
    const user = userEvent.setup();
    renderApp(['/']);

    await user.click(
      within(screen.getByTestId('chapter-row-ch1')).getByRole('button', { name: '预览' }),
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect((document.activeElement as HTMLElement | null)?.dataset.focusId).toBe('close-modal');

    await user.click(within(dialog).getByRole('button', { name: '关闭预览' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect((document.activeElement as HTMLElement | null)?.dataset.focusId).toBe('preview-ch1');
  });
});
