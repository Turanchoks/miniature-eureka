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
          <header id="main-header" />
          <div>
            {currentChat.messages
              ? ChatMessages(currentChat, users)
              : "Loading..."}
          </div>
        </main>
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, type }, users) => {
  console.log("users", users);
  const isPrivateChat = type._ === "chatTypePrivate";
  return (
    <div>
      {messages.map(
        ({
          content: { text, caption, sticker },
          isOutgoing,
          isChannelPost,
          senderUserId
        }) => {
          let data;
          if (text) {
            data = text.text;
          } else if (caption) {
            data = caption.text;
          } else if (sticker) {
            data = sticker.emoji;
          } else {
            data = "WIP";
          }
          const messageClass = isPrivateChat
            ? isOutgoing
              ? "private-message private-message_mine"
              : "private-message private-message_not-mine"
            : "";
          const senderUser = senderUserId && users[senderUserId];
          return (
            <div class={messageClass}>
              <div>
                {senderUser && senderUser.firstName}{" "}
                {senderUser && <img src={senderUser.profilePhotoSrc} />}
              </div>
              {data}
            </div>
          );
        }
      )}
    </div>
  );
};
