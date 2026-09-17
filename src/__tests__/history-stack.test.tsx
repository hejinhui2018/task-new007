import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('历史栈：目录 → 章节 → 测验抽屉', () => {
  it('沿学习路径前进后退，URL 与页面内容保持一致', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    // 目录
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
    expect(probe.location?.pathname).toBe('/');

    // 进入第二章（PUSH）
    await user.click(
      within(screen.getByTestId('chapter-row-ch2')).getByRole('link', { name: '进入章节' }),
    );
    expect(probe.location?.pathname).toBe('/chapter/ch2');
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();

    // 打开测验抽屉（PUSH 子路由），章节内容仍保留在抽屉后面
    await user.click(screen.getByRole('button', { name: '开始测验' }));
    expect(probe.location?.pathname).toBe('/chapter/ch2/quiz');
    expect(screen.getByRole('dialog', { name: '课程结业测验' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();

    // 后退一步：抽屉关闭，回到章节页
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();

    // 再后退一步：回到目录
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();

    // 前进：章节 → 抽屉逐步恢复
    act(() => {
      probe.navigate!(1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch2');
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();
    act(() => {
      probe.navigate!(1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch2/quiz');
    expect(screen.getByRole('dialog', { name: '课程结业测验' })).toBeInTheDocument();
  });

  it('章节页标记完成后，返回目录能看到最新进度', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    await user.click(
      within(screen.getByTestId('chapter-row-ch2')).getByRole('link', { name: '进入章节' }),
    );
    await user.click(screen.getByRole('button', { name: '标记为已完成' }));
    expect(screen.getByRole('button', { name: /已完成/ })).toBeDisabled();

    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/');
    expect(within(screen.getByTestId('chapter-row-ch2')).getByText('已完成')).toBeInTheDocument();
  });

  it('章节页可通过底部导航返回目录', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/']);

    await user.click(
      within(screen.getByTestId('chapter-row-ch3')).getByRole('link', { name: '进入章节' }),
    );
    expect(probe.location?.pathname).toBe('/chapter/ch3');

    await user.click(screen.getByRole('link', { name: '返回目录' }));
    expect(probe.location?.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });
});
