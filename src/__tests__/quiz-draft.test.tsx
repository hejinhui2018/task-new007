import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('测验草稿', () => {
  it('内置未提交的草稿答案，刷新后仍然保留', async () => {
    const user = userEvent.setup();
    const first = renderApp(['/chapter/ch2/quiz']);

    // 预置草稿：q1 选 b、q3 选 c
    expect(
      screen.getByRole('radio', { name: /不点击链接，通过公司内部通讯录/ }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: /先把文件发到个人邮箱再处理/ })).toBeChecked();
    expect(screen.getByText(/已答 2\/4/)).toBeInTheDocument();

    // 再答一题
    await user.click(screen.getByRole('radio', { name: /用密码管理器为每个系统生成/ }));
    expect(screen.getByText(/已答 3\/4/)).toBeInTheDocument();

    // 模拟刷新：卸载后重新进入同一地址
    first.unmount();
    renderApp(['/chapter/ch2/quiz']);
    expect(
      screen.getByRole('radio', { name: /不点击链接，通过公司内部通讯录/ }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: /用密码管理器为每个系统生成/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /先把文件发到个人邮箱再处理/ })).toBeChecked();
    expect(screen.getByText(/已答 3\/4/)).toBeInTheDocument();
  });

  it('深链打开的抽屉关闭时 replace 回章节页，不产生多余历史', async () => {
    const user = userEvent.setup();
    const { probe } = renderApp(['/chapter/ch2/quiz']);

    expect(screen.getByRole('dialog', { name: '课程结业测验' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '关闭测验' }));

    expect(probe.location?.pathname).toBe('/chapter/ch2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 再后退不会离开站点，也不会回到抽屉
    act(() => {
      probe.navigate!(-1);
    });
    expect(probe.location?.pathname).toBe('/chapter/ch2');
  });

  it('提交后显示成绩与解析，重新作答清空草稿', async () => {
    const user = userEvent.setup();
    renderApp(['/chapter/ch2/quiz']);

    // 草稿已有 q1（对）、q3（错）；补答 q2（错）、q4（对）→ 50 分
    await user.click(screen.getByRole('radio', { name: /用公司英文名加年份/ }));
    await user.click(screen.getByRole('radio', { name: /立即上报安全团队/ }));
    await user.click(screen.getByRole('button', { name: '提交答案' }));

    expect(screen.getByTestId('quiz-score')).toHaveTextContent('50');
    expect(screen.getByText(/未通过/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '重新作答' }));
    expect(screen.getByText(/已答 0\/4/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /立即上报安全团队/ })).not.toBeChecked();
  });
});
