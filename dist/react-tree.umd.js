(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types'), require('react-virtual')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types', 'react-virtual'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ReactTree = {}, global.React, global.PropTypes, global.ReactVirtual));
})(this, (function (exports, react, PropTypes, reactVirtual) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var PropTypes__default = /*#__PURE__*/_interopDefaultLegacy(PropTypes);

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  const noop = () => {};
  const isFn = value => typeof value === 'function';
  const isUndefined = value => typeof value === 'undefined';
  const getNodeAt = (nodes, index) => {
    const path = index.split('-');
    let node = {
      nodes
    };
    let i = 0;

    while (node != null && i < path.length) {
      node = node.nodes[path[i++]];
    }

    return i && i === path.length ? node : undefined;
  };
  const moveUp = (current, nodes) => {
    if (current.dataset.index === '0') {
      // we are at the start of the tree
      return [null, null];
    }

    if (current.previousElementSibling) {
      // move back a node and find the deepest leaf node
      let item = current.previousElementSibling;

      while (true) {
        const {
          isExpanded,
          isExpandable
        } = getExpandState(item);

        if (isExpandable && isExpanded) {
          // ├─ node_modules
          // │  └─ @babel
          // │     ├─ code-frame
          // │     └─ compat-data (next)
          // ├─ src (current)
          item = item.lastElementChild.lastElementChild;
        } else {
          break;
        }
      }

      return [item, getNodeAt(nodes, item.dataset.index)];
    } else {
      // ├─ node_modules
      // │  └─ @babel (next)
      // │     ├─ code-frame (current)
      // │     └─ compat-data
      return moveToParent(current, nodes);
    }
  };
  const moveDown = (current, nodes) => {
    let item = current;
    const {
      isExpanded
    } = getExpandState(current);

    if (isExpanded) {
      // ├─ node_modules (current)
      // │  └─ @babel (next)
      // │     ├─ code-frame
      // │     └─ compat-data
      // ├─ src
      item = current.lastElementChild.firstElementChild;
    } else {
      // go to parent and find its next sibling until we find a node or reach the end of the tree
      // ├─ node_modules
      // │  └─ @babel
      // │     ├─ code-frame
      // │     └─ compat-data (current)
      // ├─ src (next)
      while (true) {
        // ├─ node_modules
        // │  └─ @babel
        // │     ├─ code-frame
        // │     └─ compat-data (current)
        if (isLastItem(item, nodes)) {
          // we are at the end of the tree
          return [null, null];
        }

        if (item.nextElementSibling) {
          item = item.nextElementSibling;
          break;
        }

        item = item.parentElement.parentElement;
      }
    }

    return [item, getNodeAt(nodes, item.dataset.index)];
  };
  const moveLeft = (current, nodes) => {
    const {
      isExpandable,
      isExpanded
    } = getExpandState(current);
    const index = current.dataset.index;

    if (isExpandable && isExpanded) {
      // ├─ src (current)
      // │ ├─ App.jsx
      // │ └─ data.js       -> ├─ src (next)
      // ├─ .editorconfig      ├─ .editorconfig
      // └─ .gitignore.js      └─ .gitignore.js
      return [null, getNodeAt(nodes, index)];
    } else {
      // ├─ src (next)
      // │ ├─ App.jsx
      // │ └─ data.js (current)
      // ├─ .editorconfig
      // └─ .gitignore.js
      return moveToParent(current, nodes);
    }
  };
  const moveRight = (current, nodes) => {
    const {
      isExpandable,
      isExpanded
    } = getExpandState(current);

    if (isExpandable) {
      const index = current.dataset.index;
      const node = getNodeAt(nodes, index);

      if (isExpanded) {
        // ├─ src (current)
        // │ ├─ App.jsx (next)
        // │ └─ data.js
        // ├─ .editorconfig
        // └─ .gitignore.js
        const item = current.lastElementChild.firstElementChild;
        const next = node.nodes[0];
        return [item, next];
      } else {
        // ├─ src (current)      ├─ src (next)
        // ├─ .editorconfig      │ ├─ App.jsx
        // └─ .gitignore.js   -> │ └─ data.js
        //                       ├─ .editorconfig
        //                       └─ .gitignore.js
        return [null, node];
      }
    } // ├─ src
    // │ ├─ App.jsx
    // │ └─ data.js
    // ├─ .editorconfig (current)
    // └─ .gitignore.js


    return [null, null];
  };

  const moveToParent = (current, nodes) => {
    const path = current.dataset.index.split('-');

    if (path.length > 1) {
      const item = current.parentElement.parentElement;
      return [item, getNodeAt(nodes, item.dataset.index)];
    }

    return [null, null];
  };

  const getExpandState = node => {
    const ariaExpandedAttribute = node.getAttribute('aria-expanded');
    return {
      isExpandable: ariaExpandedAttribute !== null,
      isExpanded: ariaExpandedAttribute === 'true'
    };
  };

  const isLastItem = (item, nodes) => {
    const path = item.dataset.index.split('-');
    return path.length === 1 && parseInt(path[0], 10) === nodes.length - 1;
  };

  const shallowEquals = (prev, next, ignored) => {
    if (Object.is(prev, next)) {
      return true;
    }

    const keysPrev = Object.keys(prev).filter(key => !ignored.includes(key));
    const keysNext = Object.keys(next).filter(key => !ignored.includes(key));

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
  const internalId = Symbol('id');
  const addInternalIds = (nodes, parentId) => {
    let result = [];
    let i = nodes.length - 1;

    while (i >= 0) {
      result.push({ ...nodes[i],
        [internalId]: parentId ? `${parentId}-${i}` : `${i}`
      });
      i--;
    }

    return result;
  };
  const flattenData = (nodes, expanded) => {
    const stack = addInternalIds(nodes, '');
    const tree = [];

    while (stack.length) {
      const node = stack.pop();
      tree.push(node);

      if (expanded.includes(node.id)) {
        stack.push(...addInternalIds(node.nodes, node[internalId]));
      }
    }

    return tree;
  };

  const TreeItem = _ref => {
    let {
      node,
      index,
      selected,
      focused,
      expanded,
      setSize,
      counter,
      onItemSelect,
      renderLabel,
      onKeyDown
    } = _ref;
    const isExpandable = node.nodes.length > 0;
    const isExpanded = isExpandable ? expanded.includes(node.id) : null;
    const path = index.split('-');
    const positionInSet = parseInt(path[path.length - 1], 10) + 1;
    const el = react.useRef();
    react.useEffect(() => {
      if (counter > 0 && focused === node.id) {
        if (el.current) {
          el.current.focus();
          el.current.firstElementChild.scrollIntoView({
            block: 'nearest'
          });
        }
      }
    }, [counter]);
    return /*#__PURE__*/React.createElement("li", {
      ref: el,
      role: "treeitem",
      tabIndex: focused === node.id ? 0 : -1,
      "aria-expanded": isExpanded,
      "aria-selected": selected === node.id || null,
      "aria-level": path.length,
      "aria-posinset": positionInSet,
      "aria-setsize": setSize,
      "data-index": index,
      onKeyDown: onKeyDown
    }, isFn(renderLabel) ? renderLabel(node, {
      isExpandable,
      isExpanded
    }) : /*#__PURE__*/React.createElement("div", {
      onClick: () => onItemSelect(node)
    }, node.label), isExpanded && isExpandable && /*#__PURE__*/React.createElement("ul", {
      role: "group"
    }, node.nodes.map((node, childIndex) => /*#__PURE__*/React.createElement(MemoTreeItem, {
      key: node.id,
      node: node,
      index: index + '-' + childIndex,
      selected: selected,
      focused: focused,
      expanded: expanded,
      setSize: node.nodes.length,
      counter: counter,
      renderLabel: renderLabel,
      onItemSelect: onItemSelect,
      onKeyDown: onKeyDown
    }))));
  };
  /* istanbul ignore next */


  {
    TreeItem.displayName = 'TreeItem';
  }

  const propsAreEqual = (prev, next) => {
    // ignore object identity of these props
    const ignored = ['counter', 'selected', 'focused', 'expanded', 'onItemSelect', 'onKeyDown'];
    const areOtherPropsDifferent = !shallowEquals(prev, next, ignored);

    if (areOtherPropsDifferent) {
      // other props are different - trigger a rerender
      return false;
    } // breadth first traverse - when working with file system like trees the user usually starts from the outer nodes
    // and most of the tree changes will be happening near the root of the tree


    const stack = [{ ...next.node,
      nodes: []
    }, ...next.node.nodes];

    while (stack.length) {
      const node = stack.shift();

      if (node.id === next.focused || node.id === prev.focused) {
        // a node or one of its children has to change its `tabIndex` - trigger a rerender
        return false;
      }

      if (node.id === next.selected || node.id === prev.selected) {
        // a node or one of its children has to change its `aria-selected` - trigger a rerender
        return false;
      }

      if (prev.expanded.includes(node.id) !== next.expanded.includes(node.id)) {
        // a node or one of its children has to be collapsed/expanded - trigger a rerender
        return false;
      }

      stack.push(...node.nodes);
    }

    return true;
  };

  const MemoTreeItem = /*#__PURE__*/react.memo(TreeItem, propsAreEqual);
  var TreeItem$1 = MemoTreeItem;

  const useInternalState = (valueProp, defaultValue) => {
    const [valueState, setValueState] = react.useState(defaultValue);
    const isUncontrolled = isUndefined(valueProp);
    const value = isUncontrolled ? valueState : valueProp;
    const updateValue = react.useCallback(next => {
      if (isUncontrolled) {
        setValueState(next);
      }
    }, [isUncontrolled, value]);
    return [value, updateValue];
  };

  var useInternalState$1 = useInternalState;

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
    id: PropTypes__default["default"].string.isRequired,
    label: PropTypes__default["default"].oneOfType([PropTypes__default["default"].string, PropTypes__default["default"].node])
  };
  nodeShape.nodes = PropTypes__default["default"].arrayOf(PropTypes__default["default"].shape(nodeShape));
  const basePropTypes = {
    nodes: PropTypes__default["default"].arrayOf(PropTypes__default["default"].shape(nodeShape)).isRequired,
    defaultFocused: PropTypes__default["default"].string,
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
    onFocusChange: PropTypes__default["default"].func,
    defaultExpanded: PropTypes__default["default"].arrayOf(PropTypes__default["default"].string),
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
    onExpandChange: PropTypes__default["default"].func,
    selectionTogglesExpanded: PropTypes__default["default"].bool,
    selectionFollowsFocus: PropTypes__default["default"].bool,
    defaultSelected: PropTypes__default["default"].string,
    selected: (props, name, componentName) => {
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
    onSelectChange: PropTypes__default["default"].func,
    renderLabel: (props, name, componentName) => {
      const value = props[name];
      const comp = `\`<${componentName}>\``;

      if (typeof value !== 'function') {
        const stack = [...props.nodes];

        while (stack.length) {
          const node = stack.pop();

          if (node.label == null) {
            const message = `You didn't provide a \`renderLabel\` function in ${comp} ` + `but one or more values in the \`nodes\` prop don't have a valid \`label\` prop.`;
            return new Error(message);
          }

          stack.push(...node.nodes);
        }
      }

      return null;
    }
  };
  var basePropTypes$1 = basePropTypes;

  /**
   * An accessible tree view component, based on the WAI-ARIA authoring practices for accessible widgets.
   *
   * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
   */

  const TreeImpl = (_ref, ref) => {
    let {
      nodes,
      defaultFocused,
      focused: focusedProp,
      onFocusChange = noop,
      defaultExpanded = [],
      expanded: expandedProp,
      onExpandChange = noop,
      selectionTogglesExpanded = true,
      selectionFollowsFocus,
      defaultSelected,
      selected: selectedProp,
      onSelectChange = noop,
      renderLabel,
      ...rest
    } = _ref;
    const initialFocus = isUndefined(focusedProp) ? isUndefined(defaultFocused) && nodes.length > 0 ? nodes[0].id : defaultFocused : undefined;
    const [focused, setFocused] = useInternalState$1(focusedProp, initialFocus);
    const [expanded, setExpanded] = useInternalState$1(expandedProp, defaultExpanded);
    const [selected, setSelected] = useInternalState$1(selectedProp, defaultSelected); // hacky way to signal the currently `focused` TreeItem to call el.focus()

    const [counter, setCounter] = react.useState(0);
    react.useImperativeHandle(ref, () => {
      return {
        focus() {
          setCounter(prev => prev + 1);
        }

      };
    });

    const onKeyDown = e => {
      /* istanbul ignore next we test this, but the code coverage tool is still unconvinced */
      if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey || e.target !== e.currentTarget) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const [item, node] = moveUp(e.currentTarget, nodes);

        if (item) {
          focusTreeItem(item, node);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const [item, node] = moveDown(e.currentTarget, nodes);

        if (item) {
          focusTreeItem(item, node);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const [item, node] = moveLeft(e.currentTarget, nodes);

        if (item) {
          focusTreeItem(item, node);
        }

        if (!item && node) {
          setExpanded(prev => prev.filter(id => id !== node.id));
          onExpandChange(node);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const [item, node] = moveRight(e.currentTarget, nodes);

        if (item) {
          focusTreeItem(item, node);
        }

        if (!item && node) {
          setExpanded(prev => prev.concat(node.id));
          onExpandChange(node);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const node = getNodeAt(nodes, e.currentTarget.dataset.index);
        onItemSelect(node);
      }
    }; // @todo since the el.focus() call was moved to the TreeItem we no longer need the el


    const focusTreeItem = (el, node) => {
      setCounter(prev => prev + 1);
      setFocused(node.id);
      onFocusChange(node);

      if (selectionFollowsFocus) {
        setSelected(node.id);
        onSelectChange(node);
      }
    };

    const onItemSelect = node => {
      if (selectionTogglesExpanded && node.nodes.length > 0) {
        setExpanded(prev => {
          return prev.includes(node.id) ? prev.filter(id => id !== node.id) : prev.concat(node.id);
        });
        onExpandChange(node);
      }

      if (node.id !== focused) {
        setFocused(node.id);
        onFocusChange(node);
      }

      setSelected(node.id);
      onSelectChange(node);
    };

    return /*#__PURE__*/React.createElement("ul", _extends({
      role: "tree"
    }, rest), nodes.map((node, index) => /*#__PURE__*/React.createElement(TreeItem$1, {
      key: node.id,
      node: node,
      index: `${index}`,
      selected: selected,
      focused: focused,
      expanded: expanded,
      setSize: nodes.length,
      counter: counter,
      renderLabel: renderLabel,
      onItemSelect: onItemSelect,
      onKeyDown: onKeyDown
    })));
  };

  const Tree = /*#__PURE__*/react.forwardRef(TreeImpl);
  /* istanbul ignore next */

  {
    Tree.displayName = 'Tree';
    Tree.propTypes = { ...basePropTypes$1
    };
  }

  var Tree$1 = /*#__PURE__*/react.memo(Tree);

  const VirtualTreeItem = _ref => {
    let {
      node,
      measureRef,
      start,
      isExpanded,
      isSelected,
      tabIndex,
      level,
      positionInSet,
      setSize,
      index,
      counter,
      isFocused,
      renderLabel,
      onItemSelect,
      onKeyDown
    } = _ref;
    return /*#__PURE__*/React.createElement("li", {
      ref: measureRef,
      role: "treeitem",
      tabIndex: tabIndex,
      "aria-expanded": isExpanded,
      "aria-selected": isSelected || null,
      "aria-level": level,
      "aria-posinset": positionInSet,
      "aria-setsize": setSize,
      "data-index": index,
      style: {
        position: 'absolute',
        top: 0,
        transform: `translateY(${start}px)`,
        '--level': level
      },
      onKeyDown: onKeyDown
    }, isFn(renderLabel) ? renderLabel(node, {
      isExpanded,
      isExpandable: node.nodes.length > 0
    }) : /*#__PURE__*/React.createElement("div", {
      onClick: () => onItemSelect(node)
    }, node.label));
  };
  /* istanbul ignore next */


  {
    VirtualTreeItem.displayName = 'VirtualTreeItem';
  }

  const MemoVirtualTreeItem = /*#__PURE__*/react.memo(VirtualTreeItem, (prev, next) => // ignore object identity of these props
  shallowEquals(prev, next, ['measureRef', 'onItemSelect', 'onKeyDown']));
  var VirtualTreeItem$1 = MemoVirtualTreeItem;

  /**
   * An accessible tree view component, based on the WAI-ARIA authoring practices for accessible widgets.
   *
   * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
   */

  const VirtualTreeImpl = (_ref, ref) => {
    let {
      nodes,
      defaultFocused,
      focused: focusedProp,
      onFocusChange = noop,
      defaultExpanded = [],
      expanded: expandedProp,
      onExpandChange = noop,
      selectionTogglesExpanded = true,
      selectionFollowsFocus,
      defaultSelected,
      selected: selectedProp,
      onSelectChange = noop,
      renderLabel,
      rowHeight = 30,
      ...rest
    } = _ref;
    const initialFocus = isUndefined(focusedProp) ? isUndefined(defaultFocused) && nodes.length > 0 ? nodes[0].id : defaultFocused : undefined;
    const [focused, setFocused] = useInternalState$1(focusedProp, initialFocus);
    const [expanded, setExpanded] = useInternalState$1(expandedProp, defaultExpanded);
    const [selected, setSelected] = useInternalState$1(selectedProp, defaultSelected);
    const parentRef = react.useRef();
    const flattened = react.useMemo(() => flattenData(nodes, expanded), [nodes, expanded]);
    const rowVirtualizer = reactVirtual.useVirtual({
      estimateSize: react.useCallback(() => rowHeight, [rowHeight]),
      size: flattened.length,
      parentRef,

      // prerender the focused item, the one before it, after it, the parent item of the focused one
      rangeExtractor(range) {
        const defaultRange = reactVirtual.defaultRangeExtractor(range);
        const focusedIndex = flattened.findIndex(node => node.id === focused);

        if (focusedIndex === -1) {
          return defaultRange;
        } else {
          let range = new Set(defaultRange);
          const node = flattened[focusedIndex];
          const path = node[internalId].split('-');
          const parent = path.length > 1 ? getNodeAt(nodes, path.slice(0, -1).join('-')) : null;

          if (parent) {
            range.add(flattened.findIndex(node => node.id === parent.id));
          }

          if (focusedIndex > 0) {
            range.add(focusedIndex - 1);
          }

          range.add(focusedIndex);

          if (focusedIndex < flattened.length - 1) {
            range.add(focusedIndex + 1);
          }

          return [...range];
        }
      }

    }); // hacky way to signal the currently `focused` TreeItem to call el.focus()
    // this is mostly done to allow users of the component to call `.focus()` from the imperative handle

    const [counter, setCounter] = react.useState(0);
    react.useEffect(() => {
      if (counter > 0) {
        const index = flattened.findIndex(node => node.id === focused);
        const node = flattened[index];
        const el = parentRef.current.querySelector(`[data-index="${node[internalId]}"]`);
        rowVirtualizer.scrollToIndex(index);

        if (el) {
          el.focus();
        }
      }
    }, [counter]);
    react.useImperativeHandle(ref, () => {
      return {
        focus() {
          setCounter(prev => prev + 1);
        }

      };
    });

    const onItemSelect = node => {
      if (selectionTogglesExpanded && node.nodes.length > 0) {
        setExpanded(prev => {
          return prev.includes(node.id) ? prev.filter(id => id !== node.id) : prev.concat(node.id);
        });
        onExpandChange(node);
      }

      if (node.id !== focused) {
        setFocused(node.id);
        onFocusChange(node);
      }

      setSelected(node.id);
      onSelectChange(node);
    };

    const onKeyDown = e => {
      /* istanbul ignore next we test this, but the code coverage tool is still unconvinced */
      if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey || e.target !== e.currentTarget) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();

        if (flattened[0].id !== focused) {
          const index = flattened.findIndex(node => node.id === focused);
          const nextIndex = index - 1;
          const node = flattened[nextIndex];
          focusTreeItem(node);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();

        if (flattened[flattened.length - 1].id !== focused) {
          const index = flattened.findIndex(node => node.id === focused);
          const nextIndex = index + 1;
          const node = flattened[nextIndex];
          focusTreeItem(node);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        const {
          isExpandable,
          isExpanded
        } = getExpandState(e.currentTarget);

        if (isExpandable && isExpanded) {
          const index = flattened.findIndex(node => node.id === focused);
          const node = flattened[index];
          setExpanded(prev => prev.filter(id => id !== node.id));
          onExpandChange(node);
          focusTreeItem(node);
        } else {
          const path = e.currentTarget.dataset.index.split('-');

          if (path.length > 1) {
            const parentNode = getNodeAt(nodes, path.slice(0, -1).join('-'));
            const index = flattened.findIndex(node => node.id === parentNode.id);
            const node = flattened[index]; // we do this, because parentNode doesn't have node[internalId]

            focusTreeItem(node);
          }
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        const {
          isExpandable,
          isExpanded
        } = getExpandState(e.currentTarget);

        if (isExpandable) {
          if (isExpanded) {
            const childNode = getNodeAt(nodes, e.currentTarget.dataset.index).nodes[0];
            const index = flattened.findIndex(node => node.id === childNode.id);
            const node = flattened[index]; // we do this, because childNode doesn't have node[internalId]

            focusTreeItem(node);
          } else {
            const index = flattened.findIndex(node => node.id === focused);
            const node = flattened[index];
            setExpanded(prev => prev.concat(node.id));
            onExpandChange(node);
            focusTreeItem(node);
          }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const node = getNodeAt(nodes, e.currentTarget.dataset.index);
        onItemSelect(node);
      }
    };

    const focusTreeItem = node => {
      if (node.id !== focused) {
        setCounter(prev => prev + 1);
        setFocused(node.id);
        onFocusChange(node);
      }

      if (selectionFollowsFocus) {
        setSelected(node.id);
        onSelectChange(node);
      }
    };

    const treeStyles = react.useMemo(() => {
      return {
        height: rowVirtualizer.totalSize + 'px',
        position: 'relative',
        margin: 0,
        padding: 0
      };
    }, [rowVirtualizer.totalSize]);
    return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
      ref: parentRef
    }), /*#__PURE__*/React.createElement("ul", {
      role: "tree",
      style: treeStyles
    }, rowVirtualizer.virtualItems.map(virtualRow => {
      const node = flattened[virtualRow.index];
      const path = node[internalId].split('-');
      const level = path.length;
      const positionInSet = parseInt(path[path.length - 1], 10) + 1;
      const setSize = path.length === 1 ? nodes.length : getNodeAt(nodes, path.slice(0, -1).join('-')).nodes.length;
      const isExpandable = node.nodes.length > 0;
      const isExpanded = isExpandable ? expanded.includes(node.id) : null;
      return /*#__PURE__*/React.createElement(VirtualTreeItem$1, {
        key: virtualRow.index,
        node: node,
        measureRef: virtualRow.measureRef,
        start: virtualRow.start,
        isExpanded: isExpanded,
        isSelected: selected === node.id,
        tabIndex: focused === node.id ? 0 : -1,
        level: level,
        positionInSet: positionInSet,
        setSize: setSize,
        index: node[internalId],
        renderLabel: renderLabel,
        onItemSelect: onItemSelect,
        onKeyDown: onKeyDown
      });
    })));
  };

  const VirtualTree = /*#__PURE__*/react.forwardRef(VirtualTreeImpl);
  /* istanbul ignore next */

  {
    VirtualTree.displayName = 'VirtualTree';
    VirtualTree.propTypes = { ...basePropTypes$1
    };
  }

  var VirtualTree$1 = /*#__PURE__*/react.memo(VirtualTree);

  exports.Tree = Tree$1;
  exports.VirtualTree = VirtualTree$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
