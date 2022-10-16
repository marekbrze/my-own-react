// Functions for creating elements

function createElement(type, props, ...children) {
  return {
    // This is a simple type of a node. E.g. "h1", "p"
    type,

    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// Function for rendering element:

function createDom(fiber) {
  // Creating empty element
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // This is a definition for a filter that will be used in the next step
  const isProperty = (key) => key !== "children";

  // Any property is added to the dom element. For text nodes it's only nodeValue which equals text.
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = fiber.props[name]));

  // Below is a loop for rendering all the children.
  // For children the dom element acts like a container
  // Text node has a set empty Array for the children, so no children render for it.
  element.props.children.forEach((child) => render(child, dom));

  return dom;
}

let nextUnitOfWork = null;

function render(element, container) {
  // Container is set as the first unit of work
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
}

// Concurrency options

function performUnitOfWork(fiber) {
  // Children have dom set to null to generate it
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // Parent is set for children loop runs
  if (fiber.parent) {
    // Child is added to the parent dom
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // Here we simply get all the children for looping through them
  const elements = fiber.props.children;

  let index = 0;

  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    // Local variable for a new fiber
    const newFiber = {
      type: element.type,
      props: element.props,

      // Here we set parent to the main Fiber in the function
      parent: fiber,

      // DOM is not generated, so that why we need to do it at the begining of this function
      dom: null,
    };

    if (index === 0) {
      // First child is set
      fiber.child = newFiber;
    } else {
      // it's appended to the first child
      prevSibling.sibling = newFiber;
    }

    // we set current newFiber as prevsibling for the next run of the loop where we will append new element as a sibling.
    prevSibling = newFiber;
    index++;
  }

  // Here we return element for the next run of the workloop
  if (fiber.child) {
    // CASE 1: Fiber have a child
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      // CASE 2: Fiber has a sibling
      return nextFiber.sibling;
    }

    // CASE 3: We go up to check the parent
    nextFiber = nextFiber.parent;
  }
}

// Deadline parameter is provided by requestIdleCallback! It let's now when the thread is needed.
function workloop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // Not exactly sure why this callback is here after each of the runs... I understand this can break the rendering later on.
  requestIdleCallback(workloop);
}

// This triggers a workloop when browser is idle! https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
// React uses different scheduler right now https://github.com/facebook/react/tree/main/packages/scheduler
requestIdleCallback(workloop);

// My main Didact object:

const Didact = {
  createElement,
  render,
};

// Element for the rendering:

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <h1>My own React</h1>
    <a>
      This is a Paragraph with a <span>span element</span>
    </a>
    <b />
  </div>
);

const container = document.getElementById("app");

// Rendering of the element to the container
Didact.render(element, container);
