import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './helpers';

describe('失败导航守卫', () => {
  it('“继续学习”指向已下线章节：提示错误，历史栈不产生新记录', async () => {
    localStorage.setItem(
      'portal:progress',
      JSON.stringify({
        visited: [],
        completed: [],
        lastPosition: { chapterId: 'c99', scrollY: 1200 },
      }),
    );
    const user = userEvent.setup();
    const { navLog } = renderApp(['/catalog']);

    await user.click(screen.getByRole('button', { name: /继续学习/ }));

    // 提示失败原因，仍停留在目录页
    expect(await screen.findByText(/无法继续学习/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();

    // 关键断言：历史栈没有被这次失败的导航污染
    expect(navLog).toHaveLength(1);
    expect(navLog[0]).toMatchObject({ pathname: '/catalog' });
  });

  it('直接访问不存在的章节：展示 404，“返回目录”用 replace 抹掉坏记录', async () => {
    const user = userEvent.setup();
    const { navLog, go } = renderApp(['/chapters/c99']);

    expect(screen.getByRole('heading', { name: '找不到章节' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '返回课程目录' }));
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();
    expect(navLog.at(-1)).toMatchObject({ pathname: '/catalog', action: 'REPLACE' });

    // 坏地址已被替换掉：后退不会回到 404 页
    await go(-1);
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();
  });
});
