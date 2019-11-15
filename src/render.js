// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const EMPTY_OBJ = {};
const EMPTY_ARR = [];

const patchProperty = (node, key, prevValue, nextValue, isSvg) => {
  if (key === 'key' || key === 'ref') {
  } else if (!isSvg && key in node) {
    node[key] = nextValue == null ? '' : nextValue;
  } else if (nextValue == null || nextValue === false) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, nextValue);
  }
};

const createNode = vnode => {
  // debugger;
  const { name, props, children, type } = vnode;
  const isSvg = name === 'svg';

  let node;
  if (type === TEXT_NODE) {
    node = document.createTextNode(name);
  } else if (isSvg) {
    node = document.createElementNS('http://www.w3.org/2000/svg', name);
  } else {
    node = document.createElement(name);
  }

  for (const prop in props) {
    if (prop === 'ref') {
      props[prop](node);
    } else {
      patchProperty(node, prop, null, props[prop], isSvg);
    }
  }

  for (const child of children) {
    node.appendChild(createNode(child));
  }

  vnode.node = node;
  node.vnode = vnode;

  return node;
};

const getKey = vnode => (vnode == null ? null : vnode.key);

export const render = (parentNode, nextVNode, isSvg) => {
  console.log(nextVNode);
  const prevVNode = parentNode.vnode;
  const isMount = prevVNode == null;
  let node;

  if (prevVNode === nextVNode) {
  } else if (
    !isMount &&
    prevVNode.type === TEXT_NODE &&
    nextVNode.type === TEXT_NODE &&
    prevVNode.name !== nextVNode.name
  ) {
    node = prevVNode.node;
    node.nodeValue = nextVNode.name;
  } else if (isMount) {
    node = createNode(nextVNode);
    parentNode.appendChild(node);
  } else if (prevVNode.name !== nextVNode.name) {
    node = createNode(nextVNode);
    parentNode.appendChild(node);
    parentNode.removeChild(prevVNode.node);
  } else {
    node = prevVNode.node;
    let oldVKid, oldKey, newKey;

    let oldHead = 0;
    let newHead = 0;

    let oldTail = prevVNode.children.length - 1;
    let newTail = nextVNode.children.length - 1;

    isSvg = isSvg || nextVNode.name === 'svg';

    const oldNewPropsKeys = new Set(
      Object.keys(prevVNode.props).concat(Object.keys(nextVNode.props))
    );

    for (const key of oldNewPropsKeys) {
      const prevValue =
        key === 'selected' || key === 'value' || key === 'checked'
          ? node[key]
          : prevVNode.props[key];

      if (prevValue !== nextVNode.props[key]) {
        patchProperty(
          node,
          key,
          prevVNode.props[key],
          nextVNode.props[key],
          isSvg
        );
      }
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      oldKey = getKey(prevVNode.children[oldHead]);
      if (oldKey == null || oldKey !== getKey(nextVNode.children[newHead])) {
        break;
      }

      render(
        prevVNode.children[oldHead].node,
        nextVNode.children[newHead],
        isSvg
      );

      oldHead++;
      newHead++;
    }

    while (newHead <= newTail && oldHead <= oldTail) {
      oldKey = getKey(prevVNode.children[oldTail]);

      if (oldKey == null || oldKey !== getKey(nextVNode.children[newTail])) {
        break;
      }

      render(
        prevVNode.children[oldTail].node,
        nextVNode.children[newTail],
        isSvg
      );

      oldTail--;
      newTail--;
    }

    if (oldHead > oldTail) {
      while (newHead <= newTail) {
        oldVKid = prevVNode.children[oldHead];

        node.insertBefore(
          createNode(nextVNode.children[newHead], isSvg),
          oldVKid && oldVKid.node
        );
        newHead++;
      }
    } else if (newHead > newTail) {
      while (oldHead <= oldTail) {
        node.removeChild(prevVNode.children[oldHead].node);
        oldHead++;
      }
    } else {
      const keyed = {};
      const newKeyed = new Set();

      for (let key = oldHead; key <= oldTail; key++) {
        oldKey = prevVNode.children[key].key;
        if (oldKey != null) {
          keyed[oldKey] = prevVNode.children[key];
        }
      }

      while (newHead <= newTail) {
        oldVKid = prevVNode.children[oldHead];
        oldKey = getKey(oldVKid);
        newKey = getKey(nextVNode.children[newHead]);

        if (
          newKeyed.has(oldKey) ||
          (newKey != null && newKey === getKey(prevVNode.children[oldHead + 1]))
        ) {
          if (oldKey == null) {
            node.removeChild(oldVKid.node);
          }
          oldHead++;
          continue;
        }

        if (newKey == null || prevVNode.type === ELEMENT_NODE) {
          if (oldKey == null) {
            render(oldVKid && oldVKid.node, nextVNode.children[newHead], isSvg);
            newHead++;
          }
          oldHead++;
        } else {
          if (oldKey === newKey) {
            render(oldVKid.node, nextVNode.children[newHead], isSvg);
            newKeyed.add(newKey);
            oldHead++;
          } else {
            let tmpVKid = keyed[newKey];
            if (tmpVKid != null) {
              render(
                node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                nextVNode.children[newHead],
                isSvg
              );
              newKeyed.add(newKey);
            } else {
              render(
                oldVKid && oldVKid.node,
                nextVNode.children[newHead],
                isSvg
              );
            }
          }
          newHead++;
        }
      }

      while (oldHead <= oldTail) {
        oldVKid = prevVNode.children[oldHead];
        if (getKey(oldVKid) == null) {
          node.removeChild(oldVKid.node);
        }
        oldHead++;
      }

      for (const key in keyed) {
        if (newKeyed[key] == null) {
          node.removeChild(keyed[key].node);
        }
      }
    }
  }

  parentNode.vnode = nextVNode;
  if (node) {
    nextVNode.node = node;
  }

  return node;
};

const createVNode = (name, props, children, node, key, type) => {
  return {
    name,
    props,
    children,
    node,
    type,
    key,
  };
};

const createTextVNode = (value, node) => {
  return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, null, TEXT_NODE);
};

export const h = (component, props, ...rest) => {
  props = props || EMPTY_OBJ;

  const children = [];

  while (rest.length > 0) {
    const vnode = rest.shift();
    console.log(vnode);

    if (Array.isArray(vnode)) {
      rest.unshift(...vnode);
    } else if (vnode === false || vnode === true || vnode == null) {
    } else {
      const child = typeof vnode === 'object' ? vnode : createTextVNode(vnode);
      children.push(child);
    }
  }

  return createVNode(component, props, children, null, props.key);
};

// const hydrateNode = node => {
//   if (node.nodeType === TEXT_NODE) {
//     return createTextVNode(node.nodeValue, node);
//   }

//   const children = [];
//   for (const childNode of node.childNodes) {
//     children.push(hydrateNode(childNode));
//   }

//   return createVNode(
//     node.nodeName.toLowerCase(),
//     EMPTY_OBJ,
//     children,
//     node,
//     null,
//     ELEMENT_NODE
//   );
// };

export function shallowEquals(obj1, obj2) {
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
