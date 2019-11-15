import { setLoading, setState, state as prevState } from "./state";
import { normalize } from "./utils";
import { apiClient, downloadFile } from "./apiClient";
import { loadUsersByIds } from "./apiUsers";

export async function loadChat(currentChat) {
  setState({
    currentChat
  });

  const historyMessages = await apiClient.api
    .getChatHistory({
      chatId: currentChat.id,
      fromMessageId: currentChat.lastMessage.id,
      offset: 0,
      limit: 20
    })
    .then(({ response }) => response.messages);

  if (historyMessages && historyMessages.length > 0) {
    const messages = [...historyMessages.reverse(), currentChat.lastMessage];

    setState({
      currentChat: {
        ...currentChat,
        messages
      }
    });

    const userIds = [];
    for (const message of messages) {
      const { senderUserId } = message;
      if (senderUserId && !userIds.includes[senderUserId]) {
        userIds.push(senderUserId);
      }
    }

    loadUsersByIds(userIds);
  }
}

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

    const senderUserIds = [];
    for (const chat of chatsInfo) {
      const { lastMessage } = chat;
      if (
        lastMessage &&
        lastMessage.senderUserId &&
        !senderUserIds.includes[lastMessage.senderUserId]
      ) {
        senderUserIds.push(lastMessage.senderUserId);
      }
    }
    loadUsersByIds(senderUserIds);

    if (chatsInfo.length > 0) {
      loadChat(chatsInfo[0]);
    }

    await Promise.all(
      chatsInfo.map((chat, index) => {
        if (chat.photo && !chat.photo.small.local.isDownloadingCompleted) {
          return downloadFile(chat.photo.small.id, index + 1);
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
