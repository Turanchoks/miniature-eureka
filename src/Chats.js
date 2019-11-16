import { getDate, getLastMessageStr } from "./utils";
import { h } from "./superfine";
import { loadChat } from "./apiClient";
import { setState } from "./state";

const NOT_ONLINE_STATUSES = ["userStatusOffline", "userStatusEmpty", undefined];

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
            if (lastMessage && lastMessage.sender_user_id) {
              lastMessageSender = users[lastMessage.sender_user_id];
            }
            if (lastMessageSender) {
              lastMessageSenderStatus = lastMessageSender.status["@type"];
            }
            const chatClass = chat.id === currentChat.id ? "chat" : "chat";
            const onlineClass = NOT_ONLINE_STATUSES.includes(
              lastMessageSenderStatus
            )
              ? ""
              : "chat__avatar_online";
            return (
              <div class={chatClass} onclick={() => loadChat(chat)}>
                <div class={`chat__avatar ${onlineClass}`}>
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
                    </div>
                    <div class="chat__meta">
                      {getDate(chat.lastMessage.date)}
                    </div>
                  </div>
                  <div class="chat__info_row">
                    <div class="chat__last-message">
                      {lastMessageSender && lastMessageSender.first_name ? (
                        <span class="chat__last-message_from">
                          {lastMessageSender.first_name}:{" "}
                        </span>
                      ) : (
                        ""
                      )}

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
  const isPrivateChat = type["@type"] === "chatTypePrivate";
  return (
    <div class="messages-list">
      {messages.map(
        (
          {
            content: { text, caption, sticker, photo },
            date,
            is_outgoing,
            is_channel_post,
            sender_user_id
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
          const messageWrapperClass = is_outgoing
            ? "message out"
            : "message in";

          const messageClass = is_outgoing ? "msg msg-out" : "msg msg-in";

          const senderUser = sender_user_id && users[sender_user_id];

          const nextElement = messages[index + 1];
          const isLast =
            !nextElement ||
            (nextElement && nextElement.sender_user_id !== sender_user_id);
          const lastClass = isLast ? "last" : "";

          const prevElement = messages[index - 1];
          const isFirst =
            !prevElement ||
            (prevElement && prevElement.sender_user_id !== sender_user_id);
          const firstClass = isFirst ? "first" : "";

          const showFullMessage = !isPrivateChat && senderUser && !is_outgoing;

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
                  <div class="msg-name">{senderUser.first_name} </div>
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
