export const shallowEquals = (obj1, obj2) => {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (const key of obj1Keys) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

const isToday = (date) => {
  const today = new Date();
  return date.setHours(0,0,0,0) === today.setHours(0,0,0,0);
}

const lessThanWeekAgo = (jsDate) => {
  const today = new Date();
  return today.getDate() - jsDate.getDate() <= 7;
}

export const getDate = date => {
  const jsDate = new Date(date * 1000);
  const hours = jsDate.getHours().toString();
  const minutes = jsDate.getMinutes().toString();
  if (isToday(jsDate)) {
    return `${hours}:${minutes.padStart(2, 0)}`;
  } else if (lessThanWeekAgo(jsDate)) {
    return jsDate.toLocaleString('en-us', { weekday:'short' })
  } else {
    return jsDate.toLocaleDateString('en-us');
  }
};

export const getTimeSince = (date) => {
  const seconds = Math.floor(((new Date().getTime() / 1000) - date));
  
  let  interval = Math.floor(seconds / 31536000);
  interval = Math.floor(seconds / 2592000);

  interval = Math.floor(seconds / 86400);
  if (interval === 1) return interval + " day ago";
  if (interval > 1) return interval + " days ago";

  interval = Math.floor(seconds / 3600);
  if (interval === 1) return interval + " hour ago";
  if (interval > 1) return interval + " hours ago";

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

// TODO: handle all types of content
export const getLastMessageStr = content => {
  const type = content["@type"];
  switch (type) {
    case "messageText":
      return content.text.text;
    case "messageSticker":
      return "Sticker";
    case "messageAudio":
      return "Audio";
    case "messageDocument":
      return "Document";
    case "messagePhoto":
      return "Photo";
    case "messagePoll":
        return "Poll";
    case "messageVideo":
        return "Video";
    default:
      return "Message";
  }
};

export const getContentSizeStr = bytes => {
  const kb = bytes / 1000;
  if (kb < 1000) return kb.toFixed(2) + ' KB';
  return (kb / 1000).toFixed(2) + '  MB';
}

export const getFormattedText = content => {
  const formattedText = content.text.text;
  const entities = [];
  let i = 0;
  if (!content.text.entities) return formattedText;

  content.text.entities.forEach(ent => {
    entities.push(formattedText.substr(i, ent.offset - i));

    let formatEnt = formattedText.substr(ent.offset, ent.length);
    switch(ent.type['@type']) {
      case "textEntityTypeTextUrl":
      case "textEntityTypeUrl":
        const url = ent.type.url || formatEnt;
        formatEnt = `<a href="${url}">${formatEnt}</a>`;
        break;
      case "textEntityTypeBold":
        formatEnt = `<strong>${formatEnt}</strong>`;
        break;
      case "textEntityTypeItalic":
        formatEnt = `<em>${formatEnt}</em>`;
        break;
      case "textEntityTypePre":
        formatEnt = `<pre>${formatEnt}</pre>`;
        break;
      case "textEntityTypePreCode":
        formatEnt = `<pre><code>${formatEnt}</code></pre>`;
        break;
      case "textEntityTypeCode":
        formatEnt = `<code>${formatEnt}</code>`;
        break;

      // TODO: make cutom handler for all link types
      case "textEntityTypeMention":
      case "textEntityTypeMentionName":
      case "textEntityTypeBotCommand":
      case "textEntityTypeCashtag":
      case "textEntityTypeEmailAddress":
      case "textEntityTypeHashtag": 
      case "textEntityTypePhoneNumber":
        formatEnt = `<a href="#">${formatEnt}</a>`;
        break;
      default:
        break;
    }
    entities.push(formatEnt);

    i = ent.offset + ent.length;
  });

  entities.push(formattedText.substr(i, formattedText.length));
  return entities.join('');
};

export const normalize = list => {
  const obj = {};
  for (const item of list) {
    const { id } = item;
    if (id && !obj[id]) {
      obj[id] = item;
    }
  }
  return obj;
};

export function getBrowser() {
  let browser_name = "";
  let isIE = /*@cc_on!@*/ false || !!document.documentMode;
  let isEdge = !isIE && !!window.StyleMedia;
  if (navigator.userAgent.indexOf("Chrome") !== -1 && !isEdge) {
    browser_name = "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") !== -1 && !isEdge) {
    browser_name = "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
    browser_name = "Firefox";
  } else if (
    navigator.userAgent.indexOf("MSIE") !== -1 ||
    !!document.documentMode === true
  ) {
    //IF IE > 10
    browser_name = "IE";
  } else if (isEdge) {
    browser_name = "Edge";
  } else {
    browser_name = "Unknown";
  }

  return browser_name;
}

export function getOSName() {
  let OSName = "Unknown";
  if (window.navigator.userAgent.indexOf("Windows NT 10.0") !== -1)
    OSName = "Windows 10";
  if (window.navigator.userAgent.indexOf("Windows NT 6.2") !== -1)
    OSName = "Windows 8";
  if (window.navigator.userAgent.indexOf("Windows NT 6.1") !== -1)
    OSName = "Windows 7";
  if (window.navigator.userAgent.indexOf("Windows NT 6.0") !== -1)
    OSName = "Windows Vista";
  if (window.navigator.userAgent.indexOf("Windows NT 5.1") !== -1)
    OSName = "Windows XP";
  if (window.navigator.userAgent.indexOf("Windows NT 5.0") !== -1)
    OSName = "Windows 2000";
  if (window.navigator.userAgent.indexOf("Mac") !== -1) OSName = "Mac/iOS";
  if (window.navigator.userAgent.indexOf("X11") !== -1) OSName = "UNIX";
  if (window.navigator.userAgent.indexOf("Linux") !== -1) OSName = "Linux";

  return OSName;
}

const transformKey = s =>
  s.replace(/([_][a-z])/g, v => v.toUpperCase().replace("_", ""));

export const transformObjectKeysSnakeToCamel = obj => {
  const keys = Object.keys(obj);
  const newObj = {};
  for (const oldKey of keys) {
    const newKey = transformKey(oldKey);
    newObj[newKey] = obj[oldKey];
  }
  return newObj;
};
