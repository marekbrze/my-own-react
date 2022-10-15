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

function render(element, container) {
  // Creating empty element in the
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  // This is a definition for a filter that will be used in the next step
  const isProperty = (key) => key !== "children";

  // Any property is added to the dom element. For text nodes it's only nodeValue which equals text.
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));

  // Below is a loop for rendering all the children.
  // For children the dom element acts like a container
  // Text node has a set empty Array for the children, so no children render for it.
  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

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

// Main container for the App:

const container = document.getElementById("app");

// Rendering of the element to the container
Didact.render(element, container);