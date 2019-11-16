// import { patch as render, h } from "./superfine-raw";
import { state } from "./state";
import { renderApp } from "./renderApp";
import { apiClientStart } from "./apiClient";

apiClientStart();

renderApp(state);
