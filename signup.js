import { render, h } from "./superfine";
// import { patch as render, h } from "./superfine-raw";
import logo from "./assets/logo.png";
import monkey from "./assets/monkey.png";

const nextStep = () => {
  setState({
    step: 2
  });
};

const handleKeepSignedInChange = e => {
  setState({
    keepSignedIn: e.target.checked
  });
};

const handlePhoneChange = e => {
  setState({
    phone: e.target.value
  });
};

let state = {
  phone: "",
  keepSignedIn: false,
  step: 1
};

const SignUpFirstStep = ({ keepSignedIn, phone }) => {
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
          <div id="main" class="form-element"></div>
          <div class="basic-input form-element">
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
            <button type="button" onclick={nextStep} class="btn blue">
              <span>NEXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignUpSecondStep = ({ phone }) => {
  console.log(phone);
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="sign-up" id="second-step">
        <div class="sign-up__heading">
          <img class="logo" width="160" src={monkey} />
          <h1 class="title">{phone}</h1>
          <div class="subtitle">
            We have sent you SMS
            <br /> with the code.
          </div>
        </div>

        <div class="sign-up__form">
          <div class="basic-input form-element">
            <input type="text" required />
            <span class="basic-input__placeholder">Code</span>
          </div>

          <div class="buttonsWrapper form-element">
            <button type="button" class="btn blue">
              <span>NEXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const rootNode = document.getElementById("app");

const setState = partialState => {
  const nextState = {
    ...state,
    ...partialState
  };

  renderApp(nextState);
  state = nextState;
};

const renderApp = state => {
  render(
    rootNode,
    state.step === 1 ? SignUpFirstStep(state) : SignUpSecondStep(state)
  );
};

renderApp(state);
