import { h } from "./superfine";
import { setState, setLoading } from "./state";
import { apiClient } from "./api";
import logo from "../assets/logo.png";
import { CountryCodeSelect } from "./country-code-select/CountryCodeSelect";

const handlePhoneChange = e => {
  setState({
    phone: e.target.value
  });
};

const submitPhone = phoneNumber => {
  setLoading(true);
  apiClient.api
    .setAuthenticationPhoneNumber({
      phoneNumber
    })
    .then(r => {
      setState({
        loading: false,
        step: "check code"
      });
    })
    .catch(e => {
      console.log(e);
    });
};

const handleKeepSignedInChange = e => {
  setState({
    keepSignedIn: e.target.checked
  });
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
          {CountryCodeSelect({ state, classes: "form-element" })}
          <div class="basic-input form-element prefix-input">
            <span class="basic-input__prefix">
              {countryCodeSelectValue.diallingCode || ""}
            </span>
            <input
              value={phone}
              oninput={handlePhoneChange}
              type="text"
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
              disabled={loading}
              type="button"
              onclick={() =>
                submitPhone(`${countryCodeSelectValue.diallingCode}${phone}`)
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
