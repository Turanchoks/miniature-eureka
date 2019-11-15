// import { patch as render, h } from "./superfine-raw";
import { initUpdateApiData } from "./api";
import { state } from "./state";
import { renderApp } from "./renderApp";

initUpdateApiData();

renderApp(state);
