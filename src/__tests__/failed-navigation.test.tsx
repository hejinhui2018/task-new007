import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('失败导航', () => {
  it('不存在的章节：replace 回目录并提示，不污染历史栈', () => {
    const { probe } = renderApp(['/']);

    // 模拟一次指向失效章节的导航（如过期收藏夹、拼错的链接）
    act(() => {
      probe.navigate!('/chapter/ch99');
    });

    // 落地到目录并给出提示，失效地址已被 replace 掉
    expect(probe.location?.pathname).toBe('/');
    expect(screen.getByRole('alert')).toHaveTextContent('章节不存在或已下线');

    // 后退不会回到失效的章节地址，也不会再看到提示
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });

  it('深链到失效章节同样安全落地到目录', () => {
    const { probe } = renderApp(['/chapter/ch99']);

    expect(probe.location?.pathname).toBe('/');
    expect(screen.getByRole('alert')).toHaveTextContent('章节不存在或已下线');
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });

  it('未知路径重定向回目录，不渲染空白页', () => {
    const { probe } = renderApp(['/no/such/page']);

    expect(probe.location?.pathname).toBe('/');
    expect(screen.getByRole('alert')).toHaveTextContent('页面不存在或已移动');
    expect(screen.getByRole('heading', { level: 1, name: '信息安全意识培训' })).toBeInTheDocument();
  });
});
