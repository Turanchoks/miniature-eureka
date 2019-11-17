import { h } from './render';
import { setState, setLoading } from './state';
import { apiClient } from './apiClient';
import logo from '../assets/logo.png';
import TwoFactorSetupMonkeyClose from './Monkey/TwoFactorSetupMonkeyClose.tgs';

const handlePasswordChange = e => {
  setState({
    password: e.target.value
  });
};

const submitPassword = password => {
  setLoading(true);
  apiClient
    .send({
      '@type': 'checkAuthenticationPassword',
      password
    })
      .then(result => {
        setState({
          loading: false,
          step: 'chats'
        });
      })
      .catch(error => {
        setState({
          loading: false
        });
        console.log('submitPassword', error);
      });
};

export const SignUpPassword = state => {
  const { password, loading } = state;
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="sign-up">
        <div class="sign-up__heading">
        <div class="sign-up__monkey">
            <tgs-player
              autoplay
              loop="false"
              count="0"
              mode="normal"
              style="width: 200px;height:200px"
              src={TwoFactorSetupMonkeyClose}
            />
          </div>
          <h1 class="title">Enter a Password</h1>
          <div class="subtitle">
            Your account is protected with
            <br /> an additional password.
          </div>
        </div>

        <div class="sign-up__form">
          <div id="main" />
          <div class="basic-input form-element">
            <input
              value={password}
              oninput={handlePasswordChange}
              type="password"
              required
            />
            <span class="basic-input__placeholder">Password</span>
          </div>

          <div class="buttonsWrapper form-element">
            <button
              disabled={loading || !password}
              type="button"
              onclick={() => submitPassword(password)}
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
