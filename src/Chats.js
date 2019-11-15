import { getDate, getLastMessageStr } from './utils';
import { h } from './render';

export const Chats = ({ chats }) => {
  if (chats.length === 0) {
    return <div class="flex-wrapper flex-wrapper_center">Chats loading...</div>;
  }

  return (
    <div class="flex-wrapper">
      <div id="wrapper">
        <aside id="left-sidebar">
          {chats.map(chat => {
            return (
              <div class="chat">
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
          <header id="main-header" />
        </main>
      </div>
    </div>
  );
};
