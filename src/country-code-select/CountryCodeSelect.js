import { h, render } from '../superfine.js';
import { countries } from './countries.js';
import { setState } from '../state';

const app = document.getElementById('app');
let selectRef;

const Countries = (
  <ul class="country-code-list">
    {countries.map((item, i) => {
      return (
        <li
          key={i}
          class="country-code-list__option"
          onclick={() =>
            setState({
              countryCodeSelectOpen: false,
              countryCodeSelectValue: item,
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
);

document.onclick = e => {
  if (selectRef && selectRef.contains(e.target)) return;
  setState({
    countryCodeSelectOpen: false,
  });
};

export const CountryCodeSelect = ({
  state: { countryCodeSelectValue: value, countryCodeSelectOpen: open },
  classes,
}) => {
  return (
    <div
      class={`country-code-container${classes ? ` ${classes}` : ''}`}
      ref={el => {
        selectRef = el;
      }}
    >
      <div
        class="country-code-select"
        onclick={() =>
          setState({
            countryCodeSelectOpen: !open,
          })
        }
      >
        <div
          class={
            value
              ? 'country-code-select__value'
              : 'country-code-select__placeholder'
          }
        >
          {value ? value.name : 'Country'}
        </div>
        {open ? <span class="arrow up" /> : <span class="arrow down" />}
      </div>
      {open ? Countries : null}
    </div>
  );
};

// render(app, CountryCodeSelect(state, localSetState));
