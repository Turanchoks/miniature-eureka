import { h, render } from './src/render.js';

const app = document.getElementById('app');

let state = {
  value: 'test',
  counter: 0,
  items: [],
};

const setState = partialState => {
  const nextState = {
    ...state,
    ...partialState,
  };

  if (!shallowEquals(state, nextState)) {
    render(app, comp(nextState));
  }
  state = nextState;
};

const count = (sign = 1) => {
  setState({
    counter: state.counter + sign,
  });
};

const oninput = e => {
  setState({
    value: e.target.value,
  });
};

const onkeydown = e => {
  if (e.keyCode === 13) {
    setState({
      items: state.items.concat(e.target.value),
      value: '',
    });
  }
};

// const comp = ({ value, counter, items }) => (
//   <div>
//     <h1>Telegram</h1>
//     <div>kjdlfjks</div>
//     <ul style="font-size: 2em;">
//       {items.map((item, i) => {
//         return (
//           <li key={i}>
//             {item}{' '}
//             <button
//               onclick={() =>
//                 setState({
//                   items: items.filter((_, ii) => i !== ii),
//                 })
//               }
//             >
//               X
//             </button>
//           </li>
//         );
//       })}
//     </ul>
//     {null}
//     {false}
//     <div>sdjka</div>
//     {true}
//     <h2>{counter}</h2>
//     <button onclick={counter > 3 ? () => count(-1) : null}>-</button>
//     <button onclick={() => count(1)}>+</button>
//     <input value={value} oninput={oninput} onkeydown={onkeydown} />
//   </div>
// );

// const comp = ({ value, items }) => (
//   <div>
//     <ul>
//       {items.map((item, i) => {
//         return (
//           <li ref={console.log} key={i}>
//             {item}{" "}
//             <button
//               onclick={() =>
//                 setState({
//                   items: items.filter((_, ii) => i !== ii)
//                 })
//               }
//             >
//               X
//             </button>
//           </li>
//         );
//       })}
//     </ul>
//     <input value={value} oninput={oninput} onkeydown={onkeydown} />
//   </div>
// );

const comp = () => {
  return <div innerHTML="<h1>Test</h1>"></div>;
};

render(app, comp(state));

function shallowEquals(obj1, obj2) {
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
}
