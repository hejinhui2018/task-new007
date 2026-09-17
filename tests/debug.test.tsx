import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { renderApp, scrollToMock } from './helpers';

it('debug resume', async () => {
  localStorage.setItem(
    'portal:progress',
    JSON.stringify({
      visited: ['c1'],
      completed: [],
      lastPosition: { chapterId: 'c2', scrollY: 500 },
    }),
  );
  const user = userEvent.setup();
  const { navLog } = renderApp(['/catalog']);
  await user.click(screen.getByRole('button', { name: /继续学习/ }));
  console.log('navLog:', JSON.stringify(navLog));
  console.log('scrollTo calls:', JSON.stringify(scrollToMock.mock.calls));
  console.log('progress now:', localStorage.getItem('portal:progress'));
  expect(true).toBe(true);
});
