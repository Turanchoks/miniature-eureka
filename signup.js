import { render, h } from "./superfine";
// import { patch as render, h } from "./superfine-raw";
import logo from "./assets/logo.png";
import { airgramClient } from "/airgram";
import TwoFactorSetupMonkeyIdle from "./monkey/TwoFactorSetupMonkeyIdle.tgs";
import TwoFactorSetupMonkeyTracking from "./monkey/TwoFactorSetupMonkeyTracking.tgs";
import { shallowEquals } from "./utils";
import { CountryCodeSelect } from "./src/country-code-select/select";

const setLoading = loading => {
  setState({
    loading
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
  code: "",
  chats: [],
  keepSignedIn: false,
  step: "", // phone input | check code | chats
  loading: false,
  isAuthorized: false,
  isCodeValid: true,
  countryCodeSelectValue: "",
  countryCodeSelectOpen: false
};

const SignUpFirstStep = state => {
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
          {CountryCodeSelect(state, { setState, classes: "form-element" })}
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

const handleCodeChange = e => {
  setState({
    code: e.target.value
  });
};

const valid = value => {
  const player = document.querySelector("tgs-player");
  const sts = !value;
  const monkey = sts ? TwoFactorSetupMonkeyIdle : TwoFactorSetupMonkeyTracking;
  player.load(monkey);
};

const SignUpSecondStep = ({ code, phone, loading, isCodeValid }) => {
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

const Chats = ({ chats }) => {
  if (chats.length === 0) {
    return <div class="flex-wrapper flex-wrapper_center">Chats loading...</div>;
  }

  return (
    <div class="flex-wrapper flex-wrapper_center">
      <ul>
        {chats.map(chat => {
          return (
            <li>
              {chat.title}
              <img src={chat.imgSrc} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const rootNode = document.getElementById("app");

const setState = partialState => {
  const nextState = {
    ...state,
    ...partialState
  };

  if (!shallowEquals(state, nextState)) {
    renderApp(nextState);
  }
  state = nextState;
};

const submitPhone = phoneNumber => {
  setLoading(true);
  airgramClient.api
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

const submitCode = code => {
  setLoading(true);
  airgramClient.api
    .checkAuthenticationCode({
      code
    })
    .then(r => {
      setState({
        loading: false,
        step: "valid code"
      });
      initAndUpdateAppState();
    });
};

const CheckingYourStatus = () => {
  return (
    <div class="flex-wrapper flex-wrapper_center">Checking your status...</div>
  );
};

async function initAndUpdateAppState() {
  const authorizationState = await airgramClient.api
    .getAuthorizationState()
    .then(({ response }) => response._);

  if (authorizationState === "authorizationStateReady") {
    setState({ isAuthorized: true, step: "chats" });

    const chatsId = await airgramClient.api
      .getChats({
        offsetOrder: "9223372036854775807",
        offsetChatId: 0,
        limit: 10
      })
      .then(({ response }) => response.chatIds || []);

    const chatsInfo = await Promise.all(
      chatsId.map(chatId =>
        airgramClient.api
          .getChat({
            chatId
          })
          .then(v => v.response)
      )
    );

    setState({ chats: chatsInfo });

    await Promise.all(
      chatsInfo.map((chat, index) => {
        if (!chat.photo.small.local.isDownloadingCompleted) {
          airgramClient.api.downloadFile({
            fileId: chat.photo.small.id,
            priority: index + 1,
            synchronous: true
          });
        }
      })
    );

    const chats = await Promise.all(
      chatsInfo.map(chat =>
        airgramClient.api
          .readFile({
            fileId: chat.photo.small.id
          })
          .then(({ response }) => {
            const blob = response.data;
            let imgSrc = "";
            if (blob) {
              imgSrc = URL.createObjectURL(blob);
            }
            return { ...chat, imgSrc };
          })
      )
    );

    setState({ chats });
  } else {
    setState({ step: "phone input" });
  }
}
initAndUpdateAppState();

const Main = state => {
  const { isAuthorized, loading, step } = state;
  // getAuthorizationState is an offline request

  switch (step) {
    case "phone input":
      return SignUpFirstStep(state);
    case "check code":
      return SignUpSecondStep(state);
    case "chats":
      return Chats(state);
    default:
      return CheckingYourStatus(state);
  }
};

const renderApp = state => {
  render(rootNode, Main(state));
};

renderApp(state);
