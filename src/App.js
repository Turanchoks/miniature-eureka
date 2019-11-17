import { h } from './render';
import { setState } from './state';

let requireUpdate = false;

const nullRender = () => {
  requireUpdate = true;
  return <div />;
};

const errorRender = () => (
  <h1>An error has occured. Please try reloading the page.</h1>
);

const ric = window.requestIdleCallback || (cb => setTimeout(cb, 0));

const CheckingYourStatus = () => {
  return (
    <div class="flex-wrapper flex-wrapper_center">
      <div class="loading"></div>
    </div>
  );
};

const Components = {
  CheckingYourStatus,
};

const imports = [
  [() => import('./SignUpFirstStep'), 'SignUpFirstStep'],
  [() => import('./SignUpSecondStep'), 'SignUpSecondStep'],
  [() => import('./Chats'), 'Chats'],
];

for (const [loader, name] of imports) {
  Components[name] = nullRender;
  ric(() =>
    loader()
      // test slow connection and nullRender
      // .then(module => {
      //   return new Promise(resolve => {
      //     setTimeout(() => {
      //       resolve(module);
      //     }, 3000);
      //   });
      // })
      .then(module => {
        Components[name] = module[name];
        console.log(requireUpdate);
        if (requireUpdate) {
          // force update
          setState({
            now: Date.now(),
          });
        }
        requireUpdate = false;
      })
      .catch(() => {
        Components[name] = errorRender;
      })
  );
}

export const App = state => {
  const { isAuthorized, loading, step } = state;
  // getAuthorizationState is an offline request

  switch (step) {
    case 'phone input':
      return Components.SignUpFirstStep(state);
    case 'check code':
      return Components.SignUpSecondStep(state);
    case 'chats':
      return Components.Chats(state);
    default:
      return Components.CheckingYourStatus(state);
  }
};
