import { h, render } from '../render.js';
import { countries } from './countries.js';
import { setState } from '../state';

const app = document.getElementById('app');

export const CountryCodeSelect = ({
  state: { countryCodeSelectValue: value, countryCodeSelectOpen: open },
  classes,
}) => {
  return (
    <div class={`country-code-container${classes ? ` ${classes}` : ''}`}>
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
      <ul class={`country-code-list${open ? '' : ' hide'}`}>
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
    </div>
  );
};

// render(app, CountryCodeSelect(state, localSetState));
