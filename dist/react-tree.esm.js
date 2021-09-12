import React, { createElement, useState, useCallback, memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jsxs, jsx } from 'react/jsx-runtime';

const noop = () => {};
const isFn = value => typeof value === 'function';
const isUndefined = value => typeof value === 'undefined';
const getNodeIds = nodes => {
  const stack = [...nodes];
  const result = [];

  while (stack.length) {
    const node = stack.pop();
    result.push(node.id);
    stack.push(...node.nodes);
  }

  return result;
};
const findNode = (nodes, id) => {
  const stack = [...nodes];

  while (stack.length) {
    const node = stack.pop();

    if (node.id === id) {
      return node;
    }

    stack.push(...node.nodes);
  }

  return null;
}; // shallow equals check, but without `expanded` and `onItemSelect`

const shallowEquals = (prev, next) => {
  if (Object.is(prev, next)) {
    return true;
  }

  const keysPrev = Object.keys(prev).filter(key => key !== 'expanded' && key !== 'onItemSelect');
  const keysNext = Object.keys(next).filter(key => key !== 'expanded' && key !== 'onItemSelect');

  if (keysPrev.length !== keysNext.length) {
    return false;
  }

  for (const key of keysPrev) {
    if (!Object.prototype.hasOwnProperty.call(next, key) || !Object.is(prev[key], next[key])) {
      return false;
    }
  }

  return true;
};
const propsAreEqual = (prev, next) => {
  const id = next.id;
  const areOtherPropsDifferent = !shallowEquals(prev, next);

  if (areOtherPropsDifferent) {
    return false;
  }

  if (prev.expanded.includes(id) !== next.expanded.includes(id)) {
    return false;
  } // We don't do a check if prev.expanded has children to update, because this node won't render any children.
  // This way we can skip the checks for it and its children - they won't render either way...


  if (next.expanded.includes(id)) {
    // this node has children that may need updates
    const children = getNodeIds(next.nodes);

    for (const child of children) {
      if (prev.expanded.includes(child) !== next.expanded.includes(child)) {
        // a child node needs to be updated
        return false;
      }
    }
  }

  return true;
};

const TreeItem = ({
  onItemSelect,
  renderLabel,
  expanded,
  ...props
}) => {
  const isExpandable = props.nodes.length > 0;
  const isExpanded = isExpandable ? expanded.includes(props.id) : null;
  return /*#__PURE__*/jsxs("li", {
    role: "treeitem",
    tabIndex: -1,
    "aria-expanded": isExpanded,
    "data-id": `treeitem-${props.id}`,
    children: [isFn(renderLabel) ? renderLabel({ ...props,
      isExpanded,
      isExpandable,

      toggleItem() {
        onItemSelect(props.id, isExpandable);
      }

    }) : /*#__PURE__*/jsx("div", {
      onClick: () => onItemSelect(props.id, isExpandable),
      children: props.label
    }), isExpanded && isExpandable && /*#__PURE__*/jsx("ul", {
      role: "group",
      children: props.nodes.map(node => /*#__PURE__*/createElement(MemoTreeItem, { ...node,
        expanded: expanded,
        onItemSelect: onItemSelect,
        renderLabel: renderLabel,
        key: node.id
      }))
    })]
  });
};
/* istanbul ignore next */


if (process.env.NODE_ENV !== 'production') {
  TreeItem.displayName = 'TreeItem';
}

const MemoTreeItem = /*#__PURE__*/React.memo(TreeItem, propsAreEqual);

const useInternalState = (valueProp, defaultValue) => {
  const [valueState, setValueState] = useState(defaultValue);
  const isUncontrolled = isUndefined(valueProp);
  const value = isUncontrolled ? valueState : valueProp;
  const updateValue = useCallback(next => {
    if (isUncontrolled) {
      setValueState(next);
    }
  }, [isUncontrolled, value]);
  return [value, updateValue];
};

const Tree = ({
  nodes,
  defaultFocused,
  focused: focusedProp,
  onFocusChange = noop,
  defaultExpanded = [],
  expanded: expandedProp,
  onExpandChange = noop,
  defaultSelected,
  selected: selectedProp,
  onSelectChange = noop,
  renderLabel,
  expandOnSelect = true,
  ...rest
}) => {
  const rootEl = useRef(null);
  const initialFocus = isUndefined(focusedProp) ? isUndefined(defaultFocused) && nodes.length > 0 ? nodes[0].id : defaultFocused : undefined;
  const [focused, setFocused] = useInternalState(focusedProp, initialFocus);
  const [expanded, setExpanded] = useInternalState(expandedProp, defaultExpanded);
  const [selected, setSelected] = useInternalState(selectedProp, defaultSelected);
  useEffect(() => {
    // remove tabIndex from previous and add it to current
    const node = rootEl.current.querySelector(`[data-id="treeitem-${focused}"]`);
    const oldNode = rootEl.current.querySelector(`[tabindex="0"]`);

    if (oldNode) {
      oldNode.setAttribute('tabindex', '-1');
    }
    /* istanbul ignore next when nodes is empty it's okay not to have a focused element */


    if (node) {
      node.setAttribute('tabindex', '0');
    }
  }, [focused]);
  useEffect(() => {
    // remove aria-selected from previous and add it to current
    const node = rootEl.current.querySelector(`[data-id="treeitem-${selected}"]`);
    const oldNode = rootEl.current.querySelector(`[aria-selected="true"]`);

    if (oldNode) {
      oldNode.removeAttribute('aria-selected');
    } // selected node is optional so we don't show a warning if no node is found


    if (node) {
      node.setAttribute('aria-selected', 'true');
    }
  }, [selected]); // This function is passed as a prop to <TreeItem />, but it has custom `memo(arePropsEqual)`
  // which ignores object identity changes. If the `memo()` changes make sure to wrap this with `useCallback()`

  const onItemSelect = (id, isExpandable) => {
    const node = findNode(nodes, id);

    if (expandOnSelect && isExpandable) {
      setExpanded(prev => {
        return prev.includes(id) ? prev.filter(node => node !== id) : prev.concat(id);
      });
      onExpandChange(node);
    }

    setFocused(id);
    onFocusChange(node);
    setSelected(id);
    onSelectChange(node);
  };

  const moveToTreeItem = isPrev => {
    const items = rootEl.current.querySelectorAll('[role="treeitem"]');
    let nextNode;

    for (let i = 0; i < items.length; i++) {
      const element = items[i];

      if (element.tabIndex === 0) {
        nextNode = isPrev ? items[i - 1] : items[i + 1];
        break;
      }
    }

    if (nextNode) {
      const id = nextNode.dataset.id.replace('treeitem-', '');
      const node = findNode(nodes, id);
      setFocused(id);
      onFocusChange(node);
      nextNode.focus();
      nextNode.firstElementChild.scrollIntoView({
        block: 'center'
      });
    }
  };

  const onKeyDown = e => {
    /* istanbul ignore next we test this, but the code coverage tool is still unconvinced */
    if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault(); // move to previous node that is visible on the screen

      moveToTreeItem(true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); // move to next node that is visible on the screen

      moveToTreeItem(false);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const {
        treeItem,
        isExpandable,
        isExpanded
      } = getTreeItem(focused);

      if (isExpandable && isExpanded) {
        // close node
        const node = findNode(nodes, focused);
        setExpanded(prev => prev.filter(node => node !== focused));
        onExpandChange(node);
      } else {
        // move focus to parent node
        focusItem(treeItem.closest('[role="treeitem"]:not([tabindex="0"])'));
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const {
        treeItem,
        isExpandable,
        isExpanded
      } = getTreeItem(focused);

      if (isExpandable) {
        if (isExpanded) {
          // move focus to next child node
          focusItem(treeItem.querySelector('[role="treeitem"]'));
        } else {
          // open node
          const node = findNode(nodes, focused);
          setExpanded(prev => prev.concat(focused));
          onExpandChange(node);
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isExpandable = rootEl.current.querySelector(`[data-id="treeitem-${focused}"]`).hasAttribute('aria-expanded');
      onItemSelect(focused, isExpandable);
    }
  };

  const getTreeItem = id => {
    const treeItem = rootEl.current.querySelector(`[data-id="treeitem-${id}"]`);
    return {
      treeItem,
      isExpandable: treeItem.hasAttribute('aria-expanded'),
      isExpanded: treeItem.getAttribute('aria-expanded') === 'true'
    };
  };

  const focusItem = item => {
    if (item) {
      item.focus();
      item.firstElementChild.scrollIntoView({
        block: 'center'
      });
      const id = item.dataset.id.replace('treeitem-', '');
      const node = findNode(nodes, id);
      setFocused(id);
      onFocusChange(node);
    }
  };

  return /*#__PURE__*/jsx("ul", {
    role: "tree",
    onKeyDown: onKeyDown,
    ...rest,
    ref: rootEl,
    children: nodes.map(node => /*#__PURE__*/createElement(MemoTreeItem, { ...node,
      expanded: expanded,
      onItemSelect: onItemSelect,
      renderLabel: renderLabel,
      key: node.id
    }))
  });
};
/* istanbul ignore next */


if (process.env.NODE_ENV !== 'production') {
  const getErrorForControlled = (propName, componentName, handlerName, defaultPropName) => {
    return `You provided a \`${propName}\` prop to ${componentName} without an \`${handlerName}\` handler. ` + `This will cause the ${componentName} component to behave incorrectly. ` + `If the ${componentName} should be mutable use \`${defaultPropName}\` instead. Otherwise, set \`${handlerName}\`.`;
  };

  const getErrorForUncontrolled = (propName, componentName, handlerName, defaultPropName) => {
    return `You provided a \`${propName}\` prop as well as a \`${defaultPropName}\` prop to ${componentName}. ` + `If you want a controlled component, use the \`${propName}\` prop with an \`${handlerName}\` handler. ` + `If you want an uncontrolled component, remove the \`${propName}\` prop and use \`${defaultPropName}\` instead.`;
  };

  const getGenericTypeError = (name, componentName, expectedType, value) => {
    return `Invalid prop \`${name}\` supplied to ${componentName}. Expected \`${expectedType}\`, received \`${Array.isArray(value) ? 'array' : typeof value}\`.`;
  };

  let nodeShape = {
    id: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
  };
  nodeShape.nodes = PropTypes.arrayOf(PropTypes.shape(nodeShape));
  Tree.displayName = 'Tree';
  Tree.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.shape(nodeShape)).isRequired,
    defaultFocused: PropTypes.string,
    focused: (props, name, componentName) => {
      const value = props[name];
      const comp = `\`<${componentName}>\``;

      if (typeof value === 'string' && props.onFocusChange == null) {
        return new Error(getErrorForControlled(name, comp, 'onFocusChange', 'defaultFocused'));
      }

      if (value != null && props.defaultFocused != null) {
        return new Error(getErrorForUncontrolled(name, comp, 'onFocusChange', 'defaultFocused'));
      }

      if (value != null && typeof value !== 'string') {
        return new Error(getGenericTypeError(name, comp, 'string', value));
      }

      return null;
    },
    onFocusChange: PropTypes.func,
    defaultExpanded: PropTypes.arrayOf(PropTypes.string),
    expanded: (props, name, componentName) => {
      const value = props[name];
      const comp = `\`<${componentName}>\``;

      if (Array.isArray(value) && props.onExpandChange == null) {
        return new Error(getErrorForControlled(name, comp, 'onExpandChange', 'defaultExpanded'));
      }

      if (value != null && props.defaultExpanded != null) {
        return new Error(getErrorForUncontrolled(name, comp, 'onExpandChange', 'defaultExpanded'));
      }

      if (Array.isArray(value)) {
        const message = `You provided an array as \`${name}\` in ${comp} but one or more of the values are not string.`;
        return value.some(i => typeof i !== 'string') ? new Error(message) : null;
      }

      if (value != null && !Array.isArray(value)) {
        return new Error(getGenericTypeError(name, comp, 'array', value));
      }

      return null;
    },
    onExpandChange: PropTypes.func,
    defaultSelected: PropTypes.string,
    selected: (props, name, componentName, location) => {
      const value = props[name];
      const comp = `\`<${componentName}>\``;

      if (typeof value === 'string' && props.onSelectChange == null) {
        return new Error(getErrorForControlled(name, comp, 'onSelectChange', 'defaultSelected'));
      }

      if (value != null && props.defaultSelected != null) {
        return new Error(getErrorForUncontrolled(name, comp, 'onSelectChange', 'defaultSelected'));
      }

      if (value != null && typeof value !== 'string') {
        return new Error(getGenericTypeError(name, comp, 'string', value));
      }

      return null;
    },
    onSelectChange: PropTypes.func,
    renderLabel: PropTypes.func
  };
}

var Tree$1 = /*#__PURE__*/memo(Tree);

export default Tree$1;
