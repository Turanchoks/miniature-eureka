import { h } from './render';
import { SignUpFirstStep } from './SignUpFirstStep';
import { SignUpSecondStep } from './SignUpSecondStep';
import { Chats } from './Chats';

const CheckingYourStatus = () => {
  return (
    <div class="flex-wrapper flex-wrapper_center">Checking your status...</div>
  );
};

export const App = state => {
  const { isAuthorized, loading, step } = state;
  // getAuthorizationState is an offline request

  switch (step) {
    case 'phone input':
      return SignUpFirstStep(state);
    case 'check code':
      return SignUpSecondStep(state);
    case 'chats':
      return Chats(state);
    default:
      return CheckingYourStatus(state);
  }
};
