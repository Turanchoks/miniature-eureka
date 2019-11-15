import { render, h } from './render';
import { App } from './App';

const rootNode = document.getElementById('app');

export const renderApp = state => {
  render(rootNode, App(state));
};
