import { Airgram, Auth, prompt, toObject } from "@airgram/web";
import assert from "assert";
import { setLoading, setState } from "./state";

const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;

assert(TELEGRAM_API_ID, "TELEGRAM_API_ID should be set");
assert(TELEGRAM_API_HASH, "TELEGRAM_API_HASH should be set");

export const apiClient = new Airgram({
  apiId: TELEGRAM_API_ID,
  apiHash: TELEGRAM_API_HASH
});

export const loadChat = currentChat => {
  setState({
    currentChat
  });

  apiClient.api
    .getChatHistory({
      chatId: currentChat.id,
      fromMessageId: currentChat.lastMessage.id,
      offset: 0,
      limit: 15
    })
    .then(({ response }) => {
      if (response.messages && response.messages.length > 0) {
        setState({
          currentChat: {
            ...currentChat,
            messages: response.messages
          }
        });
      }
    });
};

export async function initUpdateApiData() {
  const authorizationState = await apiClient.api
    .getAuthorizationState()
    .then(({ response }) => response._);

  if (authorizationState === "authorizationStateReady") {
    setState({ isAuthorized: true, step: "chats" });

    const chatsId = await apiClient.api
      .getChats({
        offsetOrder: "9223372036854775807",
        offsetChatId: 0,
        limit: 10
      })
      .then(({ response }) => response.chatIds || []);

    const chatsInfo = await Promise.all(
      chatsId.map(chatId =>
        apiClient.api
          .getChat({
            chatId
          })
          .then(v => v.response)
      )
    );

    setState({ chats: chatsInfo });

    if (chatsInfo.length > 0) {
      loadChat(chatsInfo[0]);
    }

    await Promise.all(
      chatsInfo.map((chat, index) => {
        if (chat.photo && !chat.photo.small.local.isDownloadingCompleted) {
          return apiClient.api.downloadFile({
            fileId: chat.photo.small.id,
            priority: index + 1,
            synchronous: true
          });
        }
      })
    );

    const chats = await Promise.all(
      chatsInfo.map(chat => {
        if (!chat.photo) return Promise.resolve(chat);
        return apiClient.api
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
          });
      })
    );

    setState({ chats });
  } else {
    setState({ step: "phone input" });
  }
}
