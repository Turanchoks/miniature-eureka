import { setState, setLoading } from "./state";
import { apiClient, initUpdateApiData } from "./api";
import { h } from "./render";
import TwoFactorSetupMonkeyIdle from "./Monkey/TwoFactorSetupMonkeyIdle.tgs";
import TwoFactorSetupMonkeyTracking from "./Monkey/TwoFactorSetupMonkeyTracking.tgs";

const handleCodeChange = e => {
  setState({
    code: e.target.value
  });
};

const submitCode = code => {
  setLoading(true);
  apiClient.api
    .checkAuthenticationCode({
      code
    })
    .then(r => {
      setState({
        loading: false,
        step: "valid code"
      });
      initUpdateApiData();
    });
};

export const SignUpSecondStep = ({ code, phone, loading, isCodeValid }) => {
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="sign-up" id="second-step">
        <div class="sign-up__heading">
          <div class="sign-up__monkey">
            <tgs-player
              autoplay
              loop
              mode="normal"
              style="width: 200px;height:200px"
              src={TwoFactorSetupMonkeyIdle}
            />
          </div>
          <h1 class="title">{phone}</h1>
          <div class="subtitle">
            We have sent you SMS
            <br /> with the code.
          </div>
        </div>

        <div class="sign-up__form">
          <div class="basic-input form-element">
            <input
              type="text"
              required
              oninput={handleCodeChange}
              value={code}
            />
            <span class="basic-input__placeholder">Code</span>
          </div>

          <div class="buttonsWrapper form-element">
            <button
              onclick={() => submitCode(code)}
              disabled={loading}
              type="button"
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
