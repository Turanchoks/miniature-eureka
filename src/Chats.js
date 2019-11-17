import {
  getDate,
  getTimeSince,
  getContentSizeStr,
  getLastMessageStr,
  getFormattedText
} from './utils';
import { h } from './render';
import { loadChat } from './apiClient';
import { setState } from './state';

export const Chats = ({
  chats,
  currentChat,
  users,
  groups,
  quoteMessages,
  messagePhotos
}) => {
  if (chats.length === 0) {
    return (
      <div class="flex-wrapper">
        <div id="wrapper">
          <aside id="left-sidebar" class="flex-wrapper flex-wrapper_center">
            <div class="loader" />
          </aside>
          <main id="main" />
        </div>
      </div>
    );
  }

  let currentChatUser;
  let currentChatGroup;
  let currentChatUserStatus;

  if (currentChat.messages && currentChat.type['@type'] === 'chatTypePrivate') {
    currentChatUser = users[currentChat.type.user_id];
    if (currentChatUser) {
      currentChatUserStatus = currentChatUser.status['@type'];
    }
  }
  if (
    currentChat.messages &&
    ['chatTypeBasicGroup', 'chatTypeSupergroup'].includes(
      currentChat.type['@type']
    )
  ) {
    currentChatGroup =
      groups[currentChat.type.basic_group_id || currentChat.type.supergroup_id];
  }

  return (
    <div class="flex-wrapper">
      <div id="wrapper">
        <aside id="left-sidebar">
          {chats.map(chat => {
            const isPrivateChat = chat.type['@type'] === 'chatTypePrivate';

            let lastMessageSender;
            let lastMessageSenderStatus;
            const { lastMessage } = chat;
            if (lastMessage && lastMessage.sender_user_id) {
              lastMessageSender = users[lastMessage.sender_user_id];
            }
            if (lastMessageSender) {
              lastMessageSenderStatus = lastMessageSender.status['@type'];
            }
            const chatClass =
              chat.id === currentChat.id ? 'chat chat_active' : 'chat';

            const isOnline =
              isPrivateChat &&
              chat.type &&
              users[chat.type.user_id] &&
              users[chat.type.user_id].status['@type'] === 'userStatusOnline';

            const onlineClass = isOnline ? 'chat__avatar_online' : '';

            return (
              <div
                key={chat.id}
                class={chatClass}
                onclick={() => {
                  if (chat.id === currentChat.id) {
                    return;
                  }
                  loadChat(chat);
                }}
              >
                <div class={`chat__avatar ${onlineClass}`}>
                  {chat.photo && !chat.imgSrc ? (
                    <div class="chat__img" />
                  ) : chat.imgSrc ? (
                    <img src={chat.imgSrc} class="chat__img" />
                  ) : (
                    <div class="chat__img chat__img_default">
                      {chat.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div class="chat__info">
                  <div class="chat__info_row">
                    <div class="chat__name">
                      <strong>{chat.title}</strong>
                    </div>
                    <div class="chat__meta">
                      {getDate(chat.lastMessage.date)}
                    </div>
                  </div>
                  <div class="chat__info_row">
                    <div class="chat__last-message">
                      {lastMessageSender &&
                      !lastMessage.is_outgoing &&
                      lastMessageSender.firstName ? (
                        <span class="chat__last-message_from">
                          {lastMessageSender.firstName}:{' '}
                        </span>
                      ) : (
                        ''
                      )}

                      {getLastMessageStr(chat.lastMessage.content)}
                    </div>
                    {chat.unreadCount > 0 ? (
                      <div
                        class={`chat__badge ${
                          chat.unreadMentionCount > 0
                            ? 'chat__badge_unread'
                            : ''
                        }`}
                      >
                        {chat.unreadCount}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>
        <main id="main">
          {currentChat.messages ? (
            <header id="main-header">
              <div class="chat__avatar chat__avatar_small">
                {currentChat.imgSrc ? (
                  <img src={currentChat.imgSrc} class="chat__img" />
                ) : (
                  <div class="chat__img chat__img_default">
                    {currentChat.title.charAt(0)}
                  </div>
                )}
              </div>
              <div class="chat__info">
                <div class="chat__info_row condensed">
                  <div class="chat__name">
                    <strong>{currentChat.title}</strong>
                  </div>
                </div>
                <div class="chat__info_row condensed">
                  {UserStatus(
                    currentChatUserStatus,
                    currentChatUser,
                    currentChatGroup
                  )}
                </div>
              </div>
            </header>
          ) : (
            ''
          )}
          {currentChat.messages ? (
            ChatMessages(currentChat, users, quoteMessages, messagePhotos)
          ) : (
            <div class="flex-wrapper flex-wrapper_center">
              <div class="loader" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const UserStatus = (status, user, group) => {
  if (user && user.type['@type'] === 'userTypeBot') {
    return <div class="chat__status">bot</div>;
  }

  if (group && group.memberCount) {
    return (
      <div class="chat__status">
        {group.memberCount}
        {group.isChannel ? ' subscribers' : ' members'}
      </div>
    );
  }

  if (user && user.isSupport) {
    return <div class="chat__status">service notifications</div>;
  }

  switch (status) {
    case 'userStatusOnline':
      return <div class="chat__status chat__status_online">online</div>;
    case 'userStatusOffline':
      return (
        <div class="chat__status">
          {user.status.was_online
            ? `last seen ${getTimeSince(user.status.was_online)}`
            : ''}
        </div>
      );
    case 'userStatusRecently':
      return <div class="chat__status">last seen recently</div>;
    default:
      return '';
  }
};

const getMessageBody = (content, messagePhotos) => {
  const messageType = content['@type'];
  switch (messageType) {
    case 'messageDocument': {
      const extension = content.document.file_name.split('.').pop();
      return (
        <div>
          <div class="message-attachment">
            <div
              class="file-icon message-attachment-icon"
              data-type={extension}
            />
            <div class="message-attachment-info">
              {content.document.file_name}
              <div class="message-attachment-weight">
                {getContentSizeStr(content.document.document.expected_size)}
              </div>
            </div>
          </div>
          {content.caption && content.caption.text ? (
            <div class="message-caption">{content.caption.text}</div>
          ) : (
            ''
          )}
        </div>
      );
    }
    case 'messagePhoto': {
      const {
        photo: { minithumbnail, sizes }
      } = content;
      const firstPhoto = sizes[0];
      if (
        firstPhoto &&
        firstPhoto.photo.id &&
        messagePhotos[firstPhoto.photo.id]
      ) {
        return <img src={messagePhotos[firstPhoto.photo.id].imgSrc} />;
      }
      // if (minithumbnail && minithumbnail.data) {
      //   return <img src={`data:image/jpeg;base64,${minithumbnail.data}`} />;
      // }
      return <div>messagePhoto</div>;
    }
    default:
      return <span>'Wip'</span>;
  }
};

const ChatMessages = (
  { messages, type },
  users,
  quoteMessages,
  messagePhotos
) => {
  const isPrivateChat = type['@type'] === 'chatTypePrivate';
  return (
    <div class="messages-list">
      {messages.map(
        (
          {
            content,
            date,
            isOutgoing,
            isChannelPost,
            senderUserId,
            id,
            replyToMessageId
          },
          index
        ) => {
          const messageWrapperClass = isOutgoing ? 'message out' : 'message in';

          const messageClass = isOutgoing ? 'msg msg-out' : 'msg msg-in';

          const senderUser = senderUserId && users[senderUserId];

          const nextElement = messages[index + 1];
          const isLast =
            !nextElement ||
            (nextElement && nextElement.senderUserId !== senderUserId);
          const lastClass = isLast ? 'last' : '';

          const extraPaddedClass = isLast ? 'message_padded' : '';

          const prevElement = messages[index - 1];
          const isFirst =
            !prevElement ||
            (prevElement && prevElement.senderUserId !== senderUserId);
          const firstClass = isFirst ? 'first' : '';

          const showFullMessage = !isPrivateChat && senderUser && !isOutgoing;

          const formattedTextContent =
            content['@type'] === 'messageText' && getFormattedText(content);

          let quoteMessage;
          let quoteMessageFormattedTextContent;
          let quoteMessageSender;
          if (replyToMessageId && quoteMessages[replyToMessageId]) {
            quoteMessage = quoteMessages[replyToMessageId];
            quoteMessageFormattedTextContent =
              quoteMessage &&
              quoteMessage.content['@type'] === 'messageText' &&
              getFormattedText(quoteMessage.content);
            quoteMessageSender = users[quoteMessage.senderUserId] || '';
          }

          return (
            <div class={`${messageWrapperClass} ${extraPaddedClass}`}>
              {showFullMessage ? (
                <div class="msg-avatar">
                  {senderUser.profilePhoto && !senderUser.profilePhotoSrc ? (
                    <div class="chat__img" />
                  ) : senderUser.profilePhotoSrc ? (
                    <img id="msg-avatar" src={senderUser.profilePhotoSrc} />
                  ) : (
                    <div class="chat__img chat__img_default">
                      {senderUser.firstName.charAt(0)}
                    </div>
                  )}
                </div>
              ) : (
                ''
              )}
              <div class={`${messageClass} ${lastClass} ${firstClass}`}>
                {replyToMessageId && quoteMessage ? (
                  <div class="quote">
                    <div class="msg-name">{quoteMessageSender.firstName}</div>
                    <div class="msg-text">
                      {quoteMessageFormattedTextContent ? (
                        <div innerHTML={quoteMessageFormattedTextContent} />
                      ) : (
                        getMessageBody(quoteMessage.content, messagePhotos)
                      )}
                    </div>
                  </div>
                ) : (
                  ''
                )}
                {showFullMessage ? (
                  <div class="msg-text__content" class="msg-name">
                    {senderUser.firstName}
                  </div>
                ) : (
                  ''
                )}
                <div class="msg-text">
                  {formattedTextContent ? (
                    <div innerHTML={formattedTextContent} />
                  ) : (
                    getMessageBody(content, messagePhotos)
                  )}
                  <div class="msg-time">{getDate(date)}</div>
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};
