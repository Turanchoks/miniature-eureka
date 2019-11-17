import { shallowEquals } from './utils';
import { renderApp } from './renderApp';
import { countries } from './country-code-select/countries';

let state = {
  phone: '',
  code: '',
  password: '',
  chats: [],
  currentChat: {},
  keepSignedIn: false,
  step: '', // phone input | check code | chats
  loading: false,
  isAuthorized: false,
  isCodeValid: true,
  countryCodeSelectValue: '',
  countryCodeSelectOpen: false,
  countryCodeSelectPlaceholder: null,
  users: {},
  groups: {},
  userMe: {},
  countries
};

export const getState = () => state;

export const setState = partialState => {
  const nextState = {
    ...state,
    ...partialState
  };

  if (!shallowEquals(state, nextState)) {
    renderApp(nextState);
  }
  state = nextState;
};

export const setLoading = loading => {
  setState({
    loading
  });
};
