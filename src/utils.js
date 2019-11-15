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
