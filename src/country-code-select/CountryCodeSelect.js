import { h, render } from '../render.js';
import { countries } from './countries.js';
import { setState } from '../state';

const app = document.getElementById('app');
let selectRef;
let inputRef;
let listRef;

const searchCountries = e => {
  const { value } = e.target;
  if (listRef) listRef.scrollTop = 0;
  const searchResult = !!value
    ? countries.filter(({ name }) =>
        name.toLowerCase().includes(value.toLowerCase())
      )
    : countries;
  setState({
    countries: searchResult,
    countryCodeSelectPlaceholder: searchResult[0] ? searchResult[0] : '',
  });
};

document.onclick = e => {
  if (selectRef && selectRef.contains(e.target)) return;
  setState({
    countryCodeSelectOpen: false,
  });
};

export const CountryCodeSelect = ({
  state: {
    countryCodeSelectValue: value,
    countryCodeSelectOpen: open,
    countryCodeSelectPlaceholder: placeholder,
    countries,
  },
  classes,
}) => {
  return (
    <div
      class={`country-code-container${classes ? ` ${classes}` : ''}`}
      ref={el => {
        selectRef = el;
      }}
    >
      <input
        type="text"
        name="code-search"
        id="code-search"
        class="code-search"
        ref={el => {
          inputRef = el;
        }}
        oninput={searchCountries}
        onkeydown={e => {
          if (e.keyCode === 13) {
            if (inputRef) {
              inputRef.value = '';
              inputRef.blur();
            }
            setState({
              countryCodeSelectOpen: false,
              countryCodeSelectValue: placeholder,
              countries,
            });
          }
        }}
      />
      <div
        class="country-code-select"
        onclick={() => {
          if (inputRef) inputRef.focus();
          setState({
            countryCodeSelectOpen: !open,
          });
        }}
      >
        <div
          class={
            value
              ? 'country-code-select__value'
              : 'country-code-select__placeholder'
          }
        >
          {value ? value.name : !!placeholder ? placeholder.name : 'Country'}
        </div>
        {open ? <span class="arrow up" /> : <span class="arrow down" />}
      </div>
      {open ? (
        <ul
          class="country-code-list"
          ref={el => {
            listRef = el;
          }}
        >
          {countries.map((item, i) => {
            return (
              <li
                key={i}
                class={`country-code-list__option${
                  placeholder && placeholder.name === item.name
                    ? ' hovered'
                    : ''
                }`}
                onclick={() => {
                  if (inputRef) {
                    inputRef.value = '';
                    inputRef.blur();
                  }
                  setState({
                    countryCodeSelectOpen: false,
                    countryCodeSelectValue: item,
                    countries,
                  });
                }}
                onmouseover={() =>
                  setState({
                    countryCodeSelectPlaceholder: item,
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
      ) : null}
    </div>
  );
};

// render(app, CountryCodeSelect(state, localSetState));
