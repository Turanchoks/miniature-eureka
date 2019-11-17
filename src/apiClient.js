import assert from 'assert';
import TdWebClient from 'tdweb/dist/tdweb';
import {
  getBrowser,
  getOSName,
  transformObjectKeysSnakeToCamel,
  normalize,
} from './utils';
import { setState, getState } from './state';
import { push } from './router';

const TELEGRAM_API_ID = process.env.TELEGRAM_API_ID;
const TELEGRAM_API_HASH = process.env.TELEGRAM_API_HASH;

assert(TELEGRAM_API_ID, 'TELEGRAM_API_ID should be set');
assert(TELEGRAM_API_HASH, 'TELEGRAM_API_HASH should be set');

const useTestDC = false;
const WASM_FILE_NAME = 'b4b0d61282108a31908dd6b2dbd7067b.wasm';
const WASM_FILE_HASH = 'b4b0d61282108a31908dd6b2dbd7067b';

function databaseExists(dbname, callback) {
  var req = indexedDB.open(dbname);
  var existed = true;
  req.onsuccess = function() {
    req.result.close();
    if (!existed) indexedDB.deleteDatabase(dbname);
    callback(existed);
  };
  req.onupgradeneeded = function() {
    existed = false;
  };
}

const DB_NAME = useTestDC ? 'tdlib_test' : 'tdlib';

let DEFAULT_TD_WEB_CLIENT_OPTIONS = {
  logVerbosityLevel: 1,
  jsLogVerbosityLevel: 3,
  mode: 'wasm', // 'wasm-streaming'/'wasm'/'asmjs'
  prefix: DB_NAME,
  readOnly: false,
  isBackground: false,
  useDatabase: false,
  wasmUrl: `${WASM_FILE_NAME}?_sw-precache=${WASM_FILE_HASH}`,
};

const tdWebClient = new TdWebClient({
  ...DEFAULT_TD_WEB_CLIENT_OPTIONS,
  api_id: TELEGRAM_API_ID,
  api_hash: TELEGRAM_API_HASH,
});

const databaseExistsCheck = false;

tdWebClient.onUpdate = update => {
  const type = update['@type'];
  switch (type) {
    case 'updateAuthorizationState': {
      const authorizationStateType = update.authorization_state['@type'];
      switch (authorizationStateType) {
        // case "authorizationStateWaitTdlibParameters":
        // case "authorizationStateWaitEncryptionKey":
        case 'authorizationStateWaitPhoneNumber': {
          if (!databaseExistsCheck) {
            setState({ step: 'phone input' });
          }
          break;
        }
        case 'authorizationStateWaitCode': {
          const { code_info } = update.authorization_state;
          setState({ step: 'check code', phone: code_info.phone_number });
          break;
        }
        case 'authorizationStateWaitPassword': {
          setState({ step: 'wait password' });
          break;
        }
        case 'authorizationStateReady': {
          setState({ step: 'chats', isAuthorized: true });
          if (getState().chats.length === 0) {
            loadChats();
          }
          break;
        }
        default:
          break;
      }
    }
    // case "updateUser": {
    //   // setState({ user: update.user, isAuthorized: true });
    //   break;
    // }
    // case "updateChatPinnedMessage": {
    //   loadChats();
    // }
    // case "updateUserStatus": {
    //   // loadUsersByIds([update.user_id]);
    // }
    case 'updateChatLastMessage': {
      const { chat_id, last_message } = update;
      if (
        Object.keys(getState().currentChat).length > 0 &&
        chat_id === getState().currentChat.id
      ) {
        loadChat(
          {
            ...getState().currentChat,
            lastMessage: last_message,
          },
          true
        );
      }
    }

    default:
      break;
  }
};

export const apiClient = tdWebClient;

export function apiClientStart() {
  tdWebClient.send({
    '@type': 'setTdlibParameters',
    parameters: {
      '@type': 'tdParameters',
      use_test_dc: useTestDC,
      api_id: TELEGRAM_API_ID,
      api_hash: TELEGRAM_API_HASH,
      system_language_code: 'en',
      device_model: getBrowser(),
      system_version: getOSName(),
      application_version: '0.1.0',
      use_secret_chats: false,
      use_message_database: true,
      use_file_database: false,
      database_directory: '/db',
      files_directory: '/',
    },
  });
  tdWebClient.send({ '@type': 'checkDatabaseEncryptionKey' });
}

export const downloadFile = (fileId, priority = 1) =>
  apiClient.send({
    '@type': 'downloadFile',
    file_id: fileId,
    priority,
    synchronous: true,
  });

export const needToDownloadSmallPhoto = item =>
  !item.small.local.is_downloading_completed &&
  !item.small.local.is_downloading_active;

export async function loadChats() {
  const chatsId = await apiClient
    .send({
      '@type': 'getChats',
      offset_order: '9223372036854775807',
      offset_chat_id: 0,
      limit: 15,
    })
    .then(response => response.chat_ids || []);

  const chatsInfo = await Promise.all(
    chatsId.map(chatId =>
      apiClient
        .send({
          '@type': 'getChat',
          chat_id: chatId,
        })
        .then(transformObjectKeysSnakeToCamel)
    )
  );

  setState({ chats: chatsInfo });

  const senderUserIds = [];
  for (const chat of chatsInfo) {
    const { lastMessage } = chat;
    if (
      lastMessage &&
      lastMessage.sender_user_id &&
      !senderUserIds.includes[lastMessage.sender_user_id]
    ) {
      senderUserIds.push(lastMessage.sender_user_id);
    }
  }
  loadUsersByIds(senderUserIds);

  if (chatsInfo.length > 0) {
    const currentChatIdFromPath = getCurrentChatIdFromPath();
    if (currentChatIdFromPath) {
      const currentChatFromPath = chatsInfo.find(
        ({ id }) => String(id) === currentChatIdFromPath
      );
      if (currentChatFromPath) {
        loadChat(currentChatFromPath);
      }
    } else {
      loadChat(chatsInfo[0]);
    }
  }

  await Promise.all(
    chatsInfo.map((chat, index) => {
      if (chat.photo && needToDownloadSmallPhoto(chat.photo)) {
        return downloadFile(chat.photo.small.id, index + 1);
      }
    })
  );

  const chats = await Promise.all(
    chatsInfo.map(chat => {
      if (!chat.photo) return Promise.resolve(chat);
      return apiClient
        .send({
          '@type': 'readFile',
          file_id: chat.photo.small.id,
        })
        .then(response => {
          const blob = response.data;
          let imgSrc = '';
          if (blob) {
            imgSrc = URL.createObjectURL(blob);
          }
          return { ...chat, imgSrc };
        });
    })
  );

  setState({ chats });
}

export async function loadBasicGroupsByIds(groupsIds) {
  const groupsList = await Promise.all(
    groupsIds.map(groupId =>
      apiClient
        .send({
          '@type': 'getBasicGroup',
          basic_group_id: groupId,
        })
        .then(transformObjectKeysSnakeToCamel)
    )
  );

  setState({
    groups: { ...getState().groups, ...normalize(groupsList) },
  });
}

export async function loadSuperGroupsByIds(superGroupsIds) {
  const superGroupsList = await Promise.all(
    superGroupsIds.map(groupId =>
      apiClient
        .send({
          '@type': 'getSupergroup',
          supergroup_id: groupId,
        })
        .then(transformObjectKeysSnakeToCamel)
    )
  );

  setState({
    groups: { ...getState().groups, ...normalize(superGroupsList) },
  });
}

export async function loadUsersByIds(userIds) {
  const usersList = await Promise.all(
    userIds.map(userId =>
      apiClient
        .send({
          '@type': 'getUser',
          user_id: userId,
        })
        .then(transformObjectKeysSnakeToCamel)
    )
  );

  setState({
    users: { ...getState().users, ...normalize(usersList) },
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
      return apiClient
        .send({
          '@type': 'readFile',
          file_id: profilePhoto.small.id,
        })
        .then(response => {
          const blob = response.data;
          let profilePhotoSrc = '';
          if (blob) {
            profilePhotoSrc = URL.createObjectURL(blob);
          }
          return { ...user, profilePhotoSrc };
        });
    })
  );

  setState({
    users: { ...getState().users, ...normalize(usersWithProfilePhoto) },
  });
}

const getCurrentChatIdFromPath = () => {
  const { pathname } = location;
  return pathname.split('/')[1];
};

export async function loadChatPage(currentChat, offset = 0) {
  const mainEl = document.querySelector('#main');
  const scrollBeforeUpdate = mainEl.scrollHeight;
  setState({
    loadingPage: true,
  });

  if (currentChat && currentChat.messages) {
    const historyMessages = await apiClient
      .send({
        '@type': 'getChatHistory',
        chat_id: currentChat.id,
        from_message_id: currentChat.messages[0].id,
        offset: 0,
        limit: 20,
      })
      .then(({ messages }) => messages.map(transformObjectKeysSnakeToCamel));

    if (historyMessages && historyMessages.length > 0) {
      await loadAdditionalChatMessagesInfo(currentChat, historyMessages, true);
    }
  }

  if (mainEl) {
    mainEl.scrollTop = mainEl.scrollHeight - scrollBeforeUpdate;
  }

  setState({
    loadingPage: false,
  });
}

export async function loadChat(currentChat, isUpdate = false) {
  if (!isUpdate) {
    const { pathname } = location;
    const pathChatId = getCurrentChatIdFromPath();
    if (!pathChatId) {
      window.history.replaceState({}, null, currentChat.id);
    } else if (pathChatId !== String(currentChat.id)) {
      push(currentChat.id);
    }

    setState({
      currentChat,
    });
  }

  const historyMessages = await apiClient
    .send({
      '@type': 'getChatHistory',
      chat_id: currentChat.id,
      from_message_id: currentChat.lastMessage.id,
      offset: 0,
      limit: 20,
    })
    .then(({ messages }) => messages.map(transformObjectKeysSnakeToCamel));

  if (historyMessages && historyMessages.length > 0) {
    await loadAdditionalChatMessagesInfo(currentChat, historyMessages);
    if (!isUpdate) {
      // Scroll to bottom in messages list after chats loaded
      setTimeout(
        () => (document.querySelector('#main').scrollTop = 99999999),
        0
      );
    }
  }
}

const loadAdditionalChatMessagesInfo = async (
  currentChat,
  historyMessages,
  mergeChats
) => {
  const messages = mergeChats
    ? [...historyMessages.reverse(), ...currentChat.messages]
    : [
        ...historyMessages.reverse(),
        transformObjectKeysSnakeToCamel(currentChat.lastMessage),
      ];

  const quoteMessages = await apiClient
    .send({
      '@type': 'getMessages',
      chat_id: currentChat.id,
      message_ids: historyMessages.reduce((res, message) => {
        if (message.replyToMessageId !== 0) {
          res.push(message.replyToMessageId);
        }
        return res;
      }, []),
    })
    .then(({ messages }) => messages.map(transformObjectKeysSnakeToCamel));

  setState({
    currentChat: {
      ...currentChat,
      messages,
    },
    quoteMessages: {
      ...getState().quoteMessages,
      ...normalize(quoteMessages),
    },
  });

  const userIds = [];
  for (const message of messages) {
    const { senderUserId } = message;
    if (senderUserId && !userIds.includes[senderUserId]) {
      userIds.push(senderUserId);
    }
  }

  const groupsIds = [];
  if (currentChat.type && currentChat.type['@type'] === 'chatTypeBasicGroup') {
    groupsIds.push(currentChat.type.basic_group_id);
  }

  const superGroupsIds = [];
  if (currentChat.type && currentChat.type['@type'] === 'chatTypeSupergroup') {
    superGroupsIds.push(currentChat.type.supergroup_id);
  }

  loadSuperGroupsByIds(superGroupsIds);
  loadBasicGroupsByIds(groupsIds);
  loadUsersByIds(userIds);

  const messagePhotoIds = [];
  const messagePhotos = {};
  for (const message of messages) {
    const { content } = message;
    const messageType = content['@type'];
    if (messageType === 'messagePhoto') {
      const {
        photo: { sizes },
      } = content;
      const firstPhoto = sizes[0] && sizes[0].photo;
      if (firstPhoto) {
        messagePhotoIds.push(firstPhoto.id);
        messagePhotos[firstPhoto.id] = firstPhoto;
      }
    }
  }

  if (messagePhotoIds.length > 0) {
    await Promise.all(
      messagePhotoIds.map(id => {
        const messagePhoto = messagePhotos[id];
        if (
          !messagePhoto.local.is_downloading_completed &&
          !messagePhoto.local.is_downloading_active
        ) {
          return downloadFile(id);
        }
      })
    );
    await Promise.all(
      messagePhotoIds.map(id => {
        return apiClient
          .send({
            '@type': 'readFile',
            file_id: id,
          })
          .then(response => {
            const blob = response.data;
            let imgSrc = '';
            if (blob) {
              imgSrc = URL.createObjectURL(blob);
            }
            messagePhotos[id] = {
              ...messagePhotos[id],
              imgSrc,
            };
          });
      })
    );

    setState({
      messagePhotos,
    });
  }
};
