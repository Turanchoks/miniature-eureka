import { getState } from './state';
import { renderApp } from './renderApp';
import { apiClientStart } from './apiClient';

apiClientStart();

renderApp(getState());
