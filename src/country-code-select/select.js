import { h, render } from "../../superfine.js";
import { countries } from "./countries.js";

const app = document.getElementById("app");

let state = {
  value: "",
  open: false
};

const setState = partialState => {
  const nextState = {
    ...state,
    ...partialState
  };

  if (!shallowEquals(state, nextState)) {
    render(app, select(nextState));
  }
  state = nextState;
};

const oninput = e => {
  setState({
    value: e.target.value
  });
};

const onkeydown = e => {
  if (e.keyCode === 13) {
    setState({
      items: state.items.concat(e.target.value),
      value: ""
    });
  }
};

const select = ({ value, open }) => (
  <div>
    <div
      class="country-code-select"
      onclick={() =>
        setState({
          open: !open
        })
      }
    >
      <div
        class={
          value
            ? "country-code-select__value"
            : "country-code-select__placeholder"
        }
      >
        {value ? value.name : "Country"}
      </div>
      <div class="country-code-select__icon">></div>
    </div>
    <ul class={`country-code-view${open ? "" : " hide"}`}>
      {countries.map((item, i) => {
        return (
          <li
            key={i}
            class="country-code-view__option"
            onclick={() =>
              setState({
                value: item
              })
            }
          >
            <span>{item.unicode}</span>
            <span class="country-name">{item.name}</span>
            <span class="dialling-code">{item.diallingCode}</span>
          </li>
        );
      })}
    </ul>
  </div>
);

render(app, select(state));

function shallowEquals(obj1, obj2) {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (const key of obj1Keys) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}
