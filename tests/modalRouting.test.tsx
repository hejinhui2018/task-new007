import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AppRoutes from '../src/App';
import { renderApp } from './helpers';

describe('模态路由：目录上的章节预览层', () => {
  it('预览章节：URL 变为章节地址，目录保留在背景，Esc 关闭后还原', async () => {
    const user = userEvent.setup();
    const { navLog } = renderApp(['/catalog']);

    await user.click(screen.getByRole('button', { name: '预览章节：识别钓鱼邮件' }));

    // URL 指向章节地址（PUSH），但目录仍渲染在背景中
    expect(navLog.at(-1)).toMatchObject({ pathname: '/chapters/c2', action: 'PUSH' });
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();

    const dialog = screen.getByRole('dialog', { name: '识别钓鱼邮件' });
    expect(within(dialog).getByText('钓鱼邮件的常见特征')).toBeInTheDocument();

    // 焦点进入模态层
    expect(within(dialog).getByRole('button', { name: '关闭预览' })).toHaveFocus();

    // Esc 关闭模态层：URL 回到目录，焦点还给触发按钮
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(navLog.at(-1)).toMatchObject({ pathname: '/catalog', action: 'POP' });
    expect(screen.getByRole('button', { name: '预览章节：识别钓鱼邮件' })).toHaveFocus();
  });

  it('直接访问章节地址（无背景状态）渲染完整章节页而不是模态层', () => {
    renderApp(['/chapters/c2']);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();
  });

  it('模态层中打开测验抽屉：URL 带上 ?quiz=open，后退先关抽屉再关模态', async () => {
    const user = userEvent.setup();
    const { navLog, go } = renderApp(['/catalog']);

    await user.click(screen.getByRole('button', { name: '预览章节：识别钓鱼邮件' }));
    await user.click(screen.getByRole('button', { name: '打开测验' }));

    expect(navLog.at(-1)).toMatchObject({
      pathname: '/chapters/c2',
      search: '?quiz=open',
      action: 'PUSH',
    });
    expect(screen.getByRole('dialog', { name: '信息安全意识随堂测验' })).toBeInTheDocument();

    // 后退一步：抽屉关闭，模态层仍在
    await go(-1);
    expect(screen.queryByRole('dialog', { name: '信息安全意识随堂测验' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: '识别钓鱼邮件' })).toBeInTheDocument();

    // 再后退一步：模态层关闭，回到目录
    await go(-1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(navLog.at(-1)?.pathname).toBe('/catalog');
  });

  it('模态层可切换为完整章节页（replace，不新增历史记录）', async () => {
    const user = userEvent.setup();
    const { navLog } = renderApp(['/catalog']);

    await user.click(screen.getByRole('button', { name: '预览章节：密码与账号安全' }));
    await user.click(screen.getByRole('button', { name: '在完整页面中打开' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toBeInTheDocument();
    expect(navLog.at(-1)).toMatchObject({ pathname: '/chapters/c1', action: 'REPLACE' });
  });

  it('刷新后模态层状态随 history.state 恢复（真实浏览器历史）', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/catalog');

    const first = render(
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>,
    );
    await user.click(screen.getByRole('button', { name: '预览章节：识别钓鱼邮件' }));
    expect(screen.getByRole('dialog', { name: '识别钓鱼邮件' })).toBeInTheDocument();

    // 模拟刷新：整棵 React 树卸载后重新挂载，history.state 中的背景页信息仍在
    first.unmount();
    render(
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>,
    );

    expect(await screen.findByRole('dialog', { name: '识别钓鱼邮件' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();
  });
});
