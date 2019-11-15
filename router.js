import { h, render } from "./src/superfine";
// const root = document.getElementById('root');
// const data = [[123, 'fsdfsdf'], [4325, 'sdajfklasdf'], [432543, 'sdjfklasfd']];
// const exampleTemplate = document.getElementById('tg-example');

// // for (const d of data) {
// //   const
// // }
// // root.appendChild()

// console.log(exampleTemplate.cloneNode(true));

// import test from './input.html';
// console.log(test);

// function parseHTML(html) {
//   const template = document.createElement('template');
//   t.innerHTML = html;
//   return t.content.cloneNode(true);
// }

const { history } = window;

const push = href => {
  window.history.pushState({}, null, href);
  renderRouter();
};

const Link = ({ to, onclick, ...props }, children) => {
  console.log(children);
  return (
    <a
      {...props}
      href={to}
      onclick={e => {
        e.preventDefault();
        push(to);
        if (typeof onclick === "function") {
          onclick();
        }
      }}
    >
      {children}
    </a>
  );
};

const rootNode = document.getElementById("root");
const rootForRouterNode = document.getElementById("root-for-router");
render(
  rootNode,
  <div>
    <h1>
      <Link to="/">/</Link>
    </h1>
    <h1>
      <Link to="/1">/1</Link>
    </h1>
    <h1>
      <Link to="/2">/2</Link>
    </h1>
  </div>
);

const renderRouter = () => {
  const { pathname } = location;
  render(rootForRouterNode, <h1>Pathname is {pathname}</h1>);
};

renderRouter();

// window.history.pushState
