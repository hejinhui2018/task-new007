import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './helpers';

describe('历史栈：目录 ⇄ 章节 ⇄ 前进后退', () => {
  it('沿章节前进后，浏览器后退/前进按顺序回放每一次导航', async () => {
    const user = userEvent.setup();
    const { navLog, go } = renderApp(['/catalog']);

    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '进入章节：密码与账号安全' }));
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /识别钓鱼邮件 →/ }));
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /办公数据与设备安全 →/ }));
    expect(screen.getByRole('heading', { level: 1, name: '办公数据与设备安全' })).toBeInTheDocument();

    // 后退三次，逐章回到目录
    await go(-1);
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();
    await go(-1);
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toBeInTheDocument();
    await go(-1);
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识必修课' })).toBeInTheDocument();

    // 前进两次，逐章回到第二章
    await go(1);
    expect(screen.getByRole('heading', { level: 1, name: '密码与账号安全' })).toBeInTheDocument();
    await go(1);
    expect(screen.getByRole('heading', { level: 1, name: '识别钓鱼邮件' })).toBeInTheDocument();

    expect(navLog.map((entry) => entry.pathname)).toEqual([
      '/catalog',
      '/chapters/c1',
      '/chapters/c2',
      '/chapters/c3',
      '/chapters/c2',
      '/chapters/c1',
      '/catalog',
      '/chapters/c1',
      '/chapters/c2',
    ]);
  });

  it('直接访问章节地址可以进入对应章节（深链接）', () => {
    renderApp(['/chapters/c3']);
    expect(screen.getByRole('heading', { level: 1, name: '办公数据与设备安全' })).toBeInTheDocument();
  });
});
