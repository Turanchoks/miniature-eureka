// import { patch as render, h } from "./superfine-raw";
import { initUpdateApiData } from "./api";
import TwoFactorSetupMonkeyIdle from "./Monkey/TwoFactorSetupMonkeyIdle.tgs";
import TwoFactorSetupMonkeyTracking from "./Monkey/TwoFactorSetupMonkeyTracking.tgs";
import { state } from "./state";
import { renderApp } from "./renderApp";

const valid = value => {
  const player = document.querySelector("tgs-player");
  const sts = !value;
  const monkey = sts ? TwoFactorSetupMonkeyIdle : TwoFactorSetupMonkeyTracking;
  player.load(monkey);
};

initUpdateApiData();

renderApp(state);
