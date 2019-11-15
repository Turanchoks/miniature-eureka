import { shallowEquals } from "./utils";
import { renderApp } from "./renderApp";

export let state = {
  phone: "",
  code: "",
  chats: [],
  currentChat: {},
  keepSignedIn: false,
  step: "", // phone input | check code | chats
  loading: false,
  isAuthorized: false,
  isCodeValid: true,
  countryCodeSelectValue: "",
  countryCodeSelectOpen: false
};

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
