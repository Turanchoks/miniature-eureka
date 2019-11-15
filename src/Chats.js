import { getDate, getLastMessageStr } from "./utils";
import { h } from "./superfine";
import { apiClient, loadChat } from "./api";
import { setState } from "./state";

export const Chats = ({ chats, currentChat, users }) => {
  if (chats.length === 0) {
    return <div class="flex-wrapper flex-wrapper_center">Chats loading...</div>;
  }
  return (
    <div class="flex-wrapper">
      <div id="wrapper">
        <aside id="left-sidebar">
          {chats.map(chat => {
            let lastMessageSender;
            let lastMessageSenderStatus;
            const { lastMessage } = chat;
            if (lastMessage && lastMessage.senderUserId) {
              lastMessageSender = users[lastMessage.senderUserId];
            }
            if (lastMessageSender) {
              lastMessageSenderStatus = lastMessageSender.status._;
            }
            const chatClass =
              chat.id === currentChat.id ? "chat chat_active" : "chat";
            return (
              <div class={chatClass} onclick={() => loadChat(chat)}>
                <div class="chat__avatar chat__avatar_online">
                  {chat.imgSrc ? (
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
                      <div>
                        {lastMessageSender
                          ? lastMessageSender.firstName || ""
                          : ""}
                      </div>
                      <div>{lastMessageSenderStatus || ""}</div>
                    </div>
                    <div class="chat__meta">
                      {getDate(chat.lastMessage.date)}
                    </div>
                  </div>
                  <div class="chat__info_row">
                    <div class="chat__last-message">
                      {getLastMessageStr(chat.lastMessage.content)}
                    </div>
                    {chat.unreadCount > 0 ? (
                      <div
                        class={`chat__badge ${
                          chat.unreadMentionCount > 0
                            ? "chat__badge_unread"
                            : ""
                        }`}
                      >
                        {chat.unreadCount}
                      </div>
                    ) : (
                      ""
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
                  <div class="chat__status">online</div>
                </div>
              </div>
            </header>
          ) : (
            ""
          )}
          {currentChat.messages
            ? ChatMessages(currentChat, users)
            : "Loading..."}
        </main>
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, type }, users) => {
  const isPrivateChat = type._ === "chatTypePrivate";
  return (
    <div class="messages-list">
      {messages.map(
        (
          {
            content: { text, caption, sticker, photo },
            date,
            isOutgoing,
            isChannelPost,
            senderUserId
          },
          index
        ) => {
          let data;
          if (photo) {
            data = "WIP: photo with caption ";
          } else if (text) {
            data = text.text;
          } else if (caption) {
            data = caption.text;
          } else if (sticker) {
            data = sticker.emoji;
          } else {
            data = "WIP";
          }
          const messageWrapperClass = isOutgoing ? "message out" : "message in";

          const messageClass = isOutgoing ? "msg msg-out" : "msg msg-in";

          const senderUser = senderUserId && users[senderUserId];

          const nextElement = messages[index + 1];
          const isLast =
            !nextElement ||
            (nextElement && nextElement.senderUserId !== senderUserId);
          const lastClass = isLast ? "last" : "";

          const prevElement = messages[index - 1];
          const isFirst =
            !prevElement ||
            (prevElement && prevElement.senderUserId !== senderUserId);
          const firstClass = isFirst ? "first" : "";

          const showFullMessage = !isPrivateChat && senderUser && !isOutgoing;

          return (
            <div class={messageWrapperClass}>
              {showFullMessage ? (
                <div class="msg-avatar">
                  {senderUser.profilePhotoSrc ? (
                    <img id="msg-avatar" src={senderUser.profilePhotoSrc} />
                  ) : (
                    <div class="chat__img chat__img_default">
                      {senderUser.firstName.charAt(0)}
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}
              <div class={`${messageClass} ${lastClass} ${firstClass}`}>
                {showFullMessage ? (
                  <div class="msg-name">{senderUser.firstName} </div>
                ) : (
                  ""
                )}
                <div class="msg-text">
                  <span>{data}</span>
                  <div class="msg-time">
                    <span>{getDate(date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};
