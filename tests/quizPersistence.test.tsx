import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { course } from '../src/data/course';
import { loadQuizState, saveQuizState, seedQuizProgress } from '../src/lib/quizStorage';
import { renderApp } from './helpers';

describe('测验抽屉与未提交答案', () => {
  it('首次访问内置一份未提交的作答记录，且不会覆盖已有进度', () => {
    seedQuizProgress();
    const first = course.quiz.questions[0];
    expect(loadQuizState()).toMatchObject({
      submitted: false,
      answers: { [first.id]: 1 },
    });

    // 用户改了自己的答案后，再次 seed 不得覆盖
    saveQuizState({ answers: { [first.id]: 2 }, submitted: false, score: null });
    seedQuizProgress();
    expect(loadQuizState().answers[first.id]).toBe(2);
  });

  it('作答实时落盘，刷新（重挂载）后未提交的答案恢复，提交后显示得分', async () => {
    const user = userEvent.setup();
    const [q1, q2] = course.quiz.questions;

    // 通过带 ?quiz=open 的地址直接进入：抽屉保持打开
    const firstRender = renderApp(['/chapters/c1?quiz=open']);
    expect(screen.getByRole('dialog', { name: '信息安全意识随堂测验' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: q1.choices[q1.answerIndex] }));
    await user.click(screen.getByRole('radio', { name: q2.choices[q2.answerIndex] }));

    const saved = loadQuizState();
    expect(saved.submitted).toBe(false);
    expect(saved.answers[q1.id]).toBe(q1.answerIndex);
    expect(saved.answers[q2.id]).toBe(q2.answerIndex);

    // 模拟刷新：整棵 React 树卸载后重新挂载
    firstRender.unmount();
    renderApp(['/chapters/c1?quiz=open']);

    expect(screen.getByRole('radio', { name: q1.choices[q1.answerIndex] })).toBeChecked();
    expect(screen.getByRole('radio', { name: q2.choices[q2.answerIndex] })).toBeChecked();
    expect(screen.getByText(/已答 2\/5 题/)).toBeInTheDocument();

    // 答完剩余题目并提交
    for (const question of course.quiz.questions.slice(2)) {
      await user.click(screen.getByRole('radio', { name: question.choices[question.answerIndex] }));
    }
    await user.click(screen.getByRole('button', { name: '提交测验' }));

    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    expect(loadQuizState().submitted).toBe(true);
  });

  it('打开抽屉是 PUSH、关闭抽屉是 REPLACE：后退不会重新弹出抽屉', async () => {
    const user = userEvent.setup();
    const { navLog, go } = renderApp(['/catalog', '/chapters/c1'], 1);

    await user.click(screen.getByRole('button', { name: '打开测验' }));
    expect(navLog.at(-1)).toMatchObject({ pathname: '/chapters/c1', search: '?quiz=open', action: 'PUSH' });
    expect(screen.getByRole('dialog', { name: '信息安全意识随堂测验' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭测验' }));
    expect(navLog.at(-1)).toMatchObject({ pathname: '/chapters/c1', search: '', action: 'REPLACE' });
    expect(screen.queryByRole('dialog', { name: '信息安全意识随堂测验' })).not.toBeInTheDocument();

    // 后退回到目录，而不是重新打开抽屉
    await go(-1);
    expect(navLog.at(-1)?.pathname).toBe('/catalog');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
