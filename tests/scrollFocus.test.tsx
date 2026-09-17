import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AppRoutes from '../src/App';
import { renderApp, scrollToMock, setScrollY } from './helpers';

describe('滚动位置恢复', () => {
  it('章节间前进后回退：恢复原条目的滚动位置；进入新页面回到顶部', async () => {
    const user = userEvent.setup();
    const { go } = renderApp(['/catalog']);

    await user.click(screen.getByRole('link', { name: '进入章节：密码与账号安全' }));
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
    scrollToMock.mockClear();

    // 用户在第一章滚动到 800px
    setScrollY(800);
    fireEvent.scroll(window);

    await user.click(screen.getByRole('link', { name: /识别钓鱼邮件 →/ }));
    expect(scrollToMock).toHaveBeenCalledWith(0, 0); // 新页面回顶部
    scrollToMock.mockClear();

    await go(-1); // 浏览器后退
    expect(scrollToMock).toHaveBeenCalledWith(0, 800); // 恢复第一章的位置
  });

  it('刷新后从 sessionStorage 恢复滚动位置（真实浏览器历史）', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/catalog');

    const first = render(
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>,
    );
    await user.click(screen.getByRole('link', { name: '进入章节：办公数据与设备安全' }));

    setScrollY(640);
    fireEvent.scroll(window);

    // 模拟刷新：整棵 React 树卸载后重新挂载，条目 key 与 sessionStorage 都还在
    first.unmount();
    scrollToMock.mockClear();
    render(
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>,
    );

    expect(scrollToMock).toHaveBeenCalledWith(0, 640);
  });

  it('从目录“继续学习”进入章节时，恢复到上次阅读位置', async () => {
    localStorage.setItem(
      'portal:progress',
      JSON.stringify({
        visited: ['c1', 'c2'],
        completed: ['c1'],
        lastPosition: { chapterId: 'c2', scrollY: 500 },
      }),
    );
    const user = userEvent.setup();
    renderApp(['/catalog']);

    await user.click(screen.getByRole('button', { name: /继续学习/ }));

    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalledWith(0, 500);
  });
});

describe('焦点管理', () => {
  it('首次加载不抢焦点；客户端导航后焦点移到页面主标题', async () => {
    const user = userEvent.setup();
    renderApp(['/catalog']);

    expect(document.body).toHaveFocus();

    await user.click(screen.getByRole('link', { name: '进入章节：密码与账号安全' }));
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toHaveFocus();

    await user.click(screen.getByRole('link', { name: /识别钓鱼邮件 →/ }));
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toHaveFocus();
  });

  it('打开测验抽屉时焦点进入抽屉，关闭后还给“打开测验”按钮', async () => {
    const user = userEvent.setup();
    renderApp(['/chapters/c1']);

    await user.click(screen.getByRole('button', { name: '打开测验' }));
    const drawer = screen.getByRole('dialog', { name: '信息安全意识随堂测验' });
    expect(drawer).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭测验' }));
    expect(screen.queryByRole('dialog', { name: '信息安全意识随堂测验' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开测验' })).toHaveFocus();
  });
});
