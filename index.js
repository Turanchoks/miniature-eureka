const root = document.getElementById('root');
const data = [[123, 'fsdfsdf'], [4325, 'sdajfklasdf'], [432543, 'sdjfklasfd']];
const exampleTemplate = document.getElementById('tg-example');

// for (const d of data) {
//   const
// }
// root.appendChild()

console.log(exampleTemplate.cloneNode(true));

import test from './input.html';
console.log(test);

function parseHTML(html) {
  const template = document.createElement('template');
  t.innerHTML = html;
  return t.content.cloneNode(true);
}
