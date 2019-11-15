import { Airgram, Auth, prompt, toObject } from "@airgram/web";
import assert from "assert";
import { setLoading, setState, state as prevState } from "./state";
import { normalize } from "./utils";

const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;

assert(TELEGRAM_API_ID, "TELEGRAM_API_ID should be set");
assert(TELEGRAM_API_HASH, "TELEGRAM_API_HASH should be set");

export const apiClient = new Airgram({
  apiId: TELEGRAM_API_ID,
  apiHash: TELEGRAM_API_HASH
});

const needToDownloadSmallPhoto = item =>
  !item.small.local.isDownloadingCompleted &&
  !item.small.local.isDownloadingActive;

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
      if (!userIds.includes[senderUserId]) {
        userIds.push(senderUserId);
      }
    }

    const usersList = await Promise.all(
      userIds.map(userId =>
        apiClient.api
          .getUser({
            userId
          })
          .then(({ response }) => response)
      )
    );

    setState({
      users: { ...prevState.users, ...normalize(usersList) }
    });

    await Promise.all(
      usersList.map(({ profilePhoto }, index) => {
        if (profilePhoto && needToDownloadSmallPhoto(profilePhoto)) {
          return downloadFile(profilePhoto.small.id, index + 1);
        }
      })
    );

    const usersWithProfilePhoto = await Promise.all(
      usersList.map(user => {
        const { profilePhoto } = user;
        if (!profilePhoto || !profilePhoto.small.id) {
          return Promise.resolve(user);
        }
        return apiClient.api
          .readFile({
            fileId: profilePhoto.small.id
          })
          .then(({ response }) => {
            const blob = response.data;
            let profilePhotoSrc = "";
            if (blob) {
              profilePhotoSrc = URL.createObjectURL(blob);
            }
            return { ...user, profilePhotoSrc };
          });
      })
    );

    setState({
      users: { ...prevState.users, ...normalize(usersWithProfilePhoto) }
    });
  }
}

const downloadFile = (fileId, priority = 1) =>
  apiClient.api.downloadFile({
    fileId: fileId,
    priority,
    synchronous: true
  });

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
