import { render } from './render';
import { renderApp } from './renderApp';
import { state } from './state';

const { history } = window;

export const push = href => {
  window.history.pushState({}, null, href);
  renderApp(state);
};
