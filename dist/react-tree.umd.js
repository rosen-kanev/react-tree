(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('prop-types')) :
  typeof define === 'function' && define.amd ? define(['react', 'prop-types'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ReactTree = factory(global.React, global.PropTypes));
}(this, (function (React, PropTypes) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
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

  const TreeContext = /*#__PURE__*/React.createContext({
    selected: null,
    focused: null,
    expanded: [],

    onItemSelect() {},

    renderLabel() {}

  });
  TreeContext.displayName = 'TreeContext';

  const isFn = value => typeof value === 'function';

  const TreeItem = props => {
    const {
      selected,
      focused,
      expanded,
      onItemSelect,
      renderLabel
    } = React.useContext(TreeContext);
    const isExpandable = props.nodes.length > 0;
    const isExpanded = isExpandable ? expanded.includes(props.id) : null;
    return /*#__PURE__*/React__default['default'].createElement("li", {
      role: "treeitem",
      tabIndex: focused === props.id ? 0 : -1,
      "aria-expanded": isExpanded,
      "aria-selected": selected === props.id ? true : null,
      "data-id": `treeitem-${props.id}`
    }, isFn(renderLabel) ? renderLabel({ ...props,
      isExpanded,
      isExpandable,

      toggleItem() {
        onItemSelect(props.id, isExpandable);
      }

    }) : /*#__PURE__*/React__default['default'].createElement("div", {
      onClick: () => onItemSelect(props.id, isExpandable)
    }, props.label), isExpanded && isExpandable && /*#__PURE__*/React__default['default'].createElement("ul", {
      role: "group"
    }, props.nodes.map(node => /*#__PURE__*/React__default['default'].createElement(TreeItem, _extends({}, node, {
      key: node.id
    })))));
  };

  {
    TreeItem.displayName = 'TreeItem';
  }

  const useInternalState = ({
    value: valueProp,
    defaultValue,
    onChange
  }) => {
    const [valueState, setValueState] = React.useState(defaultValue);
    const isUncontrolled = typeof valueProp === 'undefined';
    const value = isUncontrolled ? valueState : valueProp;
    const updateValue = React.useCallback(updater => {
      const nextValue = typeof updater === 'function' ? updater(value) : updater;

      if (isUncontrolled) {
        setValueState(nextValue);
      }

      onChange(nextValue);
    }, [isUncontrolled, onChange, value]);
    return [value, updateValue];
  };

  const noop = () => {};

  const Tree = ({
    nodes,
    defaultFocused,
    focused: focusedProp,
    onFocusChange,
    defaultExpanded = [],
    expanded: expandedProp,
    onExpandChange = noop,
    defaultSelected,
    selected: selectedProp,
    onSelectChange = noop,
    renderLabel,
    ...rest
  }) => {
    const rootEl = React.useRef(null);
    const [focused, setFocused] = useInternalState({
      defaultValue: typeof defaultFocused === 'undefined' && nodes.length > 0 ? nodes[0].id : undefined,
      value: focusedProp,
      onChange: typeof onFocusChange === 'function' ? onFocusChange : noop
    });
    const [expanded, setExpanded] = useInternalState({
      defaultValue: defaultExpanded,
      value: expandedProp,
      onChange: typeof onExpandChange === 'function' ? onExpandChange : noop
    });
    const [selected, setSelected] = useInternalState({
      defaultValue: defaultSelected,
      value: selectedProp,
      onChange: typeof onSelectChange === 'function' ? onSelectChange : noop
    });

    const onItemSelect = (id, isExpandable) => {
      if (isExpandable) {
        setExpanded(expanded.includes(id) ? expanded.filter(node => node !== id) : expanded.concat(id));
      }

      setFocused(id);
      setSelected(id);
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
        setFocused(id);
        nextNode.focus();
        nextNode.firstElementChild.scrollIntoView({
          block: 'center'
        });
      }
    };

    const onKeyDown = e => {
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
          setExpanded(expanded.filter(node => node !== focused));
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
            setExpanded(expanded.concat(focused));
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
        setFocused(id);
      }
    };

    return /*#__PURE__*/React__default['default'].createElement(TreeContext.Provider, {
      value: {
        selected,
        focused,
        expanded,
        onItemSelect,
        renderLabel
      }
    }, /*#__PURE__*/React__default['default'].createElement("ul", _extends({
      role: "tree",
      onKeyDown: onKeyDown
    }, rest, {
      ref: rootEl
    }), nodes.map(node => /*#__PURE__*/React__default['default'].createElement(TreeItem, _extends({}, node, {
      key: node.id
    })))));
  };

  {
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
      id: PropTypes__default['default'].string.isRequired,
      label: PropTypes__default['default'].oneOfType([PropTypes__default['default'].string, PropTypes__default['default'].node]).isRequired
    };
    nodeShape.nodes = PropTypes__default['default'].arrayOf(PropTypes__default['default'].shape(nodeShape));
    Tree.displayName = 'Tree';
    Tree.propTypes = {
      nodes: PropTypes__default['default'].arrayOf(PropTypes__default['default'].shape(nodeShape)).isRequired,
      defaultFocused: PropTypes__default['default'].string,
      focused: (props, name, componentName, location) => {
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
      onFocusChange: PropTypes__default['default'].func,
      defaultExpanded: PropTypes__default['default'].arrayOf(PropTypes__default['default'].string),
      // expanded: PropTypes.arrayOf(PropTypes.string),
      expanded: (props, name, componentName, location) => {
        const value = props[name];
        const comp = `\`<${componentName}>\``;

        if (Array.isArray(value) && props.onExpandChange == null) {
          return new Error(getErrorForControlled(name, comp, 'onExpandChange', 'defaultExpanded'));
        }

        if (value != null && props.defaultExpanded != null) {
          return new Error(getErrorForUncontrolled(name, comp, 'onExpandChange', 'defaultExpanded'));
        }

        if (Array.isArray(value)) {
          const message = `You provided an array as an index in ${comp} but one or more of the values are not string.`;
          return value.some(i => typeof i !== 'string') ? new Error(message) : null;
        }

        if (value != null && !Array.isArray(value)) {
          return new Error(getGenericTypeError(name, comp, 'array', value));
        }

        return null;
      },
      onExpandChange: PropTypes__default['default'].func,
      defaultSelected: PropTypes__default['default'].string,
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
      onSelectChange: PropTypes__default['default'].func,
      renderLabel: PropTypes__default['default'].func
    };
  }

  var Tree$1 = /*#__PURE__*/React.memo(Tree);

  return Tree$1;

})));
