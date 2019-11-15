import { initUpdateApiData } from "./api";
import { state, setState } from "./state";
import { renderApp } from "./renderApp";

const valid = value => {
  const player = document.querySelector("tgs-player");
  const sts = !value;
  const monkey = sts ? TwoFactorSetupMonkeyIdle : TwoFactorSetupMonkeyTracking;
  player.load(monkey);
};

// initUpdateApiData();

setState({
  loading: false,
  step: "phone input"
});

renderApp(state);
