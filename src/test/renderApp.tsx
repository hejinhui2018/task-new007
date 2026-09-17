import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import type { Location, NavigateFunction } from 'react-router-dom';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import App from '../App';

type InitialEntries = NonNullable<ComponentProps<typeof MemoryRouter>['initialEntries']>;

export interface Probe {
  navigate: NavigateFunction | null;
  location: Location | null;
}

function NavProbe({ probe }: { probe: Probe }) {
  probe.navigate = useNavigate();
  probe.location = useLocation();
  return null;
}

/** 在内存路由中渲染完整应用，并通过 probe 暴露 navigate/location 以模拟浏览器前进后退。 */
export function renderApp(initialEntries: InitialEntries = ['/']) {
  const probe: Probe = { navigate: null, location: null };
  const utils = render(
    <MemoryRouter
      initialEntries={initialEntries}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
      <NavProbe probe={probe} />
    </MemoryRouter>,
  );
  return { probe, ...utils };
}
