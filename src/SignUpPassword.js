import { h } from './render';
import { setState, setLoading } from './state';
import { apiClient } from './apiClient';
import logo from '../assets/logo.png';

const handlePasswordChange = e => {
  setState({
    password: e.target.value
  });
};

const submitPassword = password => {
  setLoading(true);
  apiClient({
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
      console.log('submitPassword', error);
    });
};

export const SignUpPassword = state => {
  const { password, loading } = state;
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="sign-up">
        <div class="sign-up__heading">
          <img class="logo" width="160" src={logo} />
          <h1 class="title">Password</h1>
        </div>

        <div class="sign-up__form">
          <div id="main" class="form-element" />
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
