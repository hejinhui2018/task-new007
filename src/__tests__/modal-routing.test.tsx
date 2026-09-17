import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('模态路由：目录上以模态层预览章节', () => {
  it('预览打开模态层，目录保持在背景中，Esc 关闭回到目录', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    await user.click(
      within(screen.getByTestId('chapter-row-ch2')).getByRole('button', { name: '预览' }),
    );

    // URL 指向章节地址，但渲染为模态层，目录仍挂载在背景中
    expect(probe.location?.pathname).toBe('/chapter/ch2');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: '识别钓鱼邮件' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(probe.location?.pathname).toBe('/');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });

  it('模态中「打开完整章节」进入整页，后退回到模态状态', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    await user.click(
      within(screen.getByTestId('chapter-row-ch1')).getByRole('button', { name: '预览' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '打开完整章节' }));
    expect(probe.location?.pathname).toBe('/chapter/ch1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toBeInTheDocument();
    // 整页模式下目录不再渲染
    expect(screen.queryByRole('heading', { level: 1, name: '信息安全意识培训' })).not.toBeInTheDocument();

    // 后退：回到模态层 + 背景目录的状态
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch1');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });

  it('直接访问章节 URL（深链/刷新）渲染完整章节页而非模态层', () => {
    renderApp(['/chapter/ch3']);

    expect(screen.getByRole('heading', { level: 1, name: '数据分类与外发安全' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: '信息安全意识培训' })).not.toBeInTheDocument();
  });

  it('带模态状态的历史条目恢复后仍显示为模态层（刷新恢复）', () => {
    renderApp([
      '/',
      {
        pathname: '/chapter/ch2',
        state: {
          backgroundLocation: { pathname: '/', search: '', hash: '', state: null, key: 'bg' },
          overlay: true,
        },
      },
    ]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });
});
