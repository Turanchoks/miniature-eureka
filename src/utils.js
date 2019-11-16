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

// TODO: check if not today, show short day of week
// if not current week, show m/dd/yy
export const getDate = date => {
  const jsDate = new Date(date * 1000);
  const hours = jsDate.getHours().toString();
  const minutes = jsDate.getMinutes().toString();
  return `${hours}:${minutes.padStart(2, 0)}`;
};

// TODO: handle all types of content
export const getLastMessageStr = content => {
  switch (content._) {
    case "messageText":
      return content.text.text;
    case "messagePhoto":
      return "Photo";
    default:
      return "Message";
  }
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
