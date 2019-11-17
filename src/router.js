import { render } from './render';
import { renderApp } from './renderApp';
import { getState } from './state';

const { history } = window;

export const push = href => {
  if (location.pathname === href) {
    return;
  }
  history.pushState({}, null, href);
  renderApp(getState());
};
