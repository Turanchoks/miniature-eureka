import { h } from './render';
import { setState, setLoading } from './state';
import { apiClient } from './apiClient';
import logo from '../assets/logo.png';
import { CountryCodeSelect } from './country-code-select/CountryCodeSelect';

const handlePhoneChange = (value, code) => {
  setState({
    phone: code ? value.substr(code.length + 1) : value,
  });
};

const submitPhone = phoneNumber => {
  setLoading(true);
  apiClient
    .send({
      '@type': 'setAuthenticationPhoneNumber',
      phone_number: phoneNumber,
    })
    .then(result => {
      setState({
        loading: false,
        step: 'check code',
      });
    })
    .catch(error => {
      console.log('submitPhone', error);
    });
};

const handleKeepSignedInChange = e => {
  setState({
    keepSignedIn: e.target.checked,
  });
};

const onInputKeyDown = e => {
  var key = e.keyCode || e.which;
  if ((key < 48 || key > 57) && key !== 8 && key !== 46) {
    if (e.preventDefault) e.preventDefault();
  }
};

export const SignUpFirstStep = state => {
  const { keepSignedIn, phone, loading, countryCodeSelectValue } = state;
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="sign-up">
        <div class="sign-up__heading">
          <img class="logo" width="160" src={logo} />
          <h1 class="title">Sign in to Telegram</h1>
          <div class="subtitle">
            Please confirm your country code and <br /> enter your phone number
          </div>
        </div>

        <div class="sign-up__form">
          <div id="main" class="form-element" />
          {CountryCodeSelect({ state, classes: 'form-element' })}
          <div class="basic-input form-element">
            <input
              value={
                countryCodeSelectValue
                  ? `${countryCodeSelectValue.diallingCode || ''} ${phone}`
                  : phone
              }
              oninput={({ target }) =>
                handlePhoneChange(
                  target.value,
                  countryCodeSelectValue.diallingCode
                )
              }
              onkeydown={onInputKeyDown}
              type="tel"
              required
            />
            <span class="basic-input__placeholder">Phone number</span>
          </div>
          <div class="basic-checkbox form-element">
            <input
              id="keep-signed"
              onchange={handleKeepSignedInChange}
              checked={keepSignedIn}
              type="checkbox"
              class="base-checkbox"
            />
            <label for="keep-signed">Keep me signed in</label>
          </div>

          <div class="buttonsWrapper form-element">
            <button
              disabled={loading || !phone || !countryCodeSelectValue}
              type="button"
              onclick={() =>
                submitPhone(
                  `${countryCodeSelectValue.diallingCode || ''}${phone}`
                )
              }
              class="btn blue"
            >
              <span>NEXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
