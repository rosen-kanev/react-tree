'use strict';

var react = require('react');
var PropTypes = require('prop-types');
var jsxRuntime = require('react/jsx-runtime');

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var TreeContext = /*#__PURE__*/react.createContext({
  selected: null,
  focused: null,
  expanded: [],
  onItemSelect: function onItemSelect() {},
  renderLabel: function renderLabel() {}
});
TreeContext.displayName = 'TreeContext';

var isFn = function isFn(value) {
  return typeof value === 'function';
};

var TreeItem = function TreeItem(props) {
  var _useContext = react.useContext(TreeContext),
      selected = _useContext.selected,
      focused = _useContext.focused,
      expanded = _useContext.expanded,
      onItemSelect = _useContext.onItemSelect,
      renderLabel = _useContext.renderLabel;

  var isExpandable = props.nodes.length > 0;
  var isExpanded = isExpandable ? expanded.includes(props.id) : null;
  return /*#__PURE__*/jsxRuntime.jsxs("li", {
    role: "treeitem",
    tabIndex: focused === props.id ? 0 : -1,
    "aria-expanded": isExpanded,
    "aria-selected": selected === props.id ? true : null,
    "data-id": "treeitem-" + props.id,
    children: [isFn(renderLabel) ? renderLabel(_extends({}, props, {
      isExpanded: isExpanded,
      isExpandable: isExpandable,
      toggleItem: function toggleItem() {
        onItemSelect(props.id, isExpandable);
      }
    })) : /*#__PURE__*/jsxRuntime.jsx("div", {
      onClick: function onClick() {
        return onItemSelect(props.id, isExpandable);
      },
      children: props.label
    }), isExpanded && isExpandable && /*#__PURE__*/jsxRuntime.jsx("ul", {
      role: "group",
      children: props.nodes.map(function (node) {
        return /*#__PURE__*/react.createElement(TreeItem, _extends({}, node, {
          key: node.id
        }));
      })
    })]
  });
};

if (process.env.NODE_ENV !== 'production') {
  TreeItem.displayName = 'TreeItem';
}

var useInternalState = function useInternalState(_ref) {
  var valueProp = _ref.value,
      defaultValue = _ref.defaultValue,
      onChange = _ref.onChange;

  var _useState = react.useState(defaultValue),
      valueState = _useState[0],
      setValueState = _useState[1];

  var isUncontrolled = typeof valueProp === 'undefined';
  var value = isUncontrolled ? valueState : valueProp;
  var updateValue = react.useCallback(function (updater) {
    var nextValue = typeof updater === 'function' ? updater(value) : updater;

    if (isUncontrolled) {
      setValueState(nextValue);
    }

    onChange(nextValue);
  }, [isUncontrolled, onChange, value]);
  return [value, updateValue];
};

var _excluded = ["nodes", "defaultFocused", "focused", "onFocusChange", "defaultExpanded", "expanded", "onExpandChange", "defaultSelected", "selected", "onSelectChange", "renderLabel"];

var noop = function noop() {};

var Tree = function Tree(_ref) {
  var nodes = _ref.nodes,
      defaultFocused = _ref.defaultFocused,
      focusedProp = _ref.focused,
      onFocusChange = _ref.onFocusChange,
      _ref$defaultExpanded = _ref.defaultExpanded,
      defaultExpanded = _ref$defaultExpanded === void 0 ? [] : _ref$defaultExpanded,
      expandedProp = _ref.expanded,
      _ref$onExpandChange = _ref.onExpandChange,
      onExpandChange = _ref$onExpandChange === void 0 ? noop : _ref$onExpandChange,
      defaultSelected = _ref.defaultSelected,
      selectedProp = _ref.selected,
      _ref$onSelectChange = _ref.onSelectChange,
      onSelectChange = _ref$onSelectChange === void 0 ? noop : _ref$onSelectChange,
      renderLabel = _ref.renderLabel,
      rest = _objectWithoutPropertiesLoose(_ref, _excluded);

  var rootEl = react.useRef(null);

  var _useInternalState = useInternalState({
    defaultValue: typeof defaultFocused === 'undefined' && nodes.length > 0 ? nodes[0].id : undefined,
    value: focusedProp,
    onChange: typeof onFocusChange === 'function' ? onFocusChange : noop
  }),
      focused = _useInternalState[0],
      setFocused = _useInternalState[1];

  var _useInternalState2 = useInternalState({
    defaultValue: defaultExpanded,
    value: expandedProp,
    onChange: typeof onExpandChange === 'function' ? onExpandChange : noop
  }),
      expanded = _useInternalState2[0],
      setExpanded = _useInternalState2[1];

  var _useInternalState3 = useInternalState({
    defaultValue: defaultSelected,
    value: selectedProp,
    onChange: typeof onSelectChange === 'function' ? onSelectChange : noop
  }),
      selected = _useInternalState3[0],
      setSelected = _useInternalState3[1];

  var onItemSelect = function onItemSelect(id, isExpandable) {
    if (isExpandable) {
      setExpanded(expanded.includes(id) ? expanded.filter(function (node) {
        return node !== id;
      }) : expanded.concat(id));
    }

    setFocused(id);
    setSelected(id);
  };

  var moveToTreeItem = function moveToTreeItem(isPrev) {
    var items = rootEl.current.querySelectorAll('[role="treeitem"]');
    var nextNode;

    for (var i = 0; i < items.length; i++) {
      var element = items[i];

      if (element.tabIndex === 0) {
        nextNode = isPrev ? items[i - 1] : items[i + 1];
        break;
      }
    }

    if (nextNode) {
      var id = nextNode.dataset.id.replace('treeitem-', '');
      setFocused(id);
      nextNode.focus();
      nextNode.firstElementChild.scrollIntoView({
        block: 'center'
      });
    }
  };

  var onKeyDown = function onKeyDown(e) {
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

      var _getTreeItem = getTreeItem(focused),
          treeItem = _getTreeItem.treeItem,
          isExpandable = _getTreeItem.isExpandable,
          isExpanded = _getTreeItem.isExpanded;

      if (isExpandable && isExpanded) {
        // close node
        setExpanded(expanded.filter(function (node) {
          return node !== focused;
        }));
      } else {
        // move focus to parent node
        focusItem(treeItem.closest('[role="treeitem"]:not([tabindex="0"])'));
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();

      var _getTreeItem2 = getTreeItem(focused),
          _treeItem = _getTreeItem2.treeItem,
          _isExpandable = _getTreeItem2.isExpandable,
          _isExpanded = _getTreeItem2.isExpanded;

      if (_isExpandable) {
        if (_isExpanded) {
          // move focus to next child node
          focusItem(_treeItem.querySelector('[role="treeitem"]'));
        } else {
          // open node
          setExpanded(expanded.concat(focused));
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      var _isExpandable2 = rootEl.current.querySelector("[data-id=\"treeitem-" + focused + "\"]").hasAttribute('aria-expanded');

      onItemSelect(focused, _isExpandable2);
    }
  };

  var getTreeItem = function getTreeItem(id) {
    var treeItem = rootEl.current.querySelector("[data-id=\"treeitem-" + id + "\"]");
    return {
      treeItem: treeItem,
      isExpandable: treeItem.hasAttribute('aria-expanded'),
      isExpanded: treeItem.getAttribute('aria-expanded') === 'true'
    };
  };

  var focusItem = function focusItem(item) {
    if (item) {
      item.focus();
      item.firstElementChild.scrollIntoView({
        block: 'center'
      });
      var id = item.dataset.id.replace('treeitem-', '');
      setFocused(id);
    }
  };

  return /*#__PURE__*/jsxRuntime.jsx(TreeContext.Provider, {
    value: {
      selected: selected,
      focused: focused,
      expanded: expanded,
      onItemSelect: onItemSelect,
      renderLabel: renderLabel
    },
    children: /*#__PURE__*/jsxRuntime.jsx("ul", _extends({
      role: "tree",
      onKeyDown: onKeyDown
    }, rest, {
      ref: rootEl,
      children: nodes.map(function (node) {
        return /*#__PURE__*/react.createElement(TreeItem, _extends({}, node, {
          key: node.id
        }));
      })
    }))
  });
};

if (process.env.NODE_ENV !== 'production') {
  var getErrorForControlled = function getErrorForControlled(propName, componentName, handlerName, defaultPropName) {
    return "You provided a `" + propName + "` prop to " + componentName + " without an `" + handlerName + "` handler. " + ("This will cause the " + componentName + " component to behave incorrectly. ") + ("If the " + componentName + " should be mutable use `" + defaultPropName + "` instead. Otherwise, set `" + handlerName + "`.");
  };

  var getErrorForUncontrolled = function getErrorForUncontrolled(propName, componentName, handlerName, defaultPropName) {
    return "You provided a `" + propName + "` prop as well as a `" + defaultPropName + "` prop to " + componentName + ". " + ("If you want a controlled component, use the `" + propName + "` prop with an `" + handlerName + "` handler. ") + ("If you want an uncontrolled component, remove the `" + propName + "` prop and use `" + defaultPropName + "` instead.");
  };

  var getGenericTypeError = function getGenericTypeError(name, componentName, expectedType, value) {
    return "Invalid prop `" + name + "` supplied to " + componentName + ". Expected `" + expectedType + "`, received `" + (Array.isArray(value) ? 'array' : typeof value) + "`.";
  };

  var nodeShape = {
    id: PropTypes__default['default'].string.isRequired,
    label: PropTypes__default['default'].oneOfType([PropTypes__default['default'].string, PropTypes__default['default'].node]).isRequired
  };
  nodeShape.nodes = PropTypes__default['default'].arrayOf(PropTypes__default['default'].shape(nodeShape));
  Tree.displayName = 'Tree';
  Tree.propTypes = {
    nodes: PropTypes__default['default'].arrayOf(PropTypes__default['default'].shape(nodeShape)).isRequired,
    defaultFocused: PropTypes__default['default'].string,
    focused: function focused(props, name, componentName, location) {
      var value = props[name];
      var comp = "`<" + componentName + ">`";

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
    expanded: function expanded(props, name, componentName, location) {
      var value = props[name];
      var comp = "`<" + componentName + ">`";

      if (Array.isArray(value) && props.onExpandChange == null) {
        return new Error(getErrorForControlled(name, comp, 'onExpandChange', 'defaultExpanded'));
      }

      if (value != null && props.defaultExpanded != null) {
        return new Error(getErrorForUncontrolled(name, comp, 'onExpandChange', 'defaultExpanded'));
      }

      if (Array.isArray(value)) {
        var message = "You provided an array as an index in " + comp + " but one or more of the values are not string.";
        return value.some(function (i) {
          return typeof i !== 'string';
        }) ? new Error(message) : null;
      }

      if (value != null && !Array.isArray(value)) {
        return new Error(getGenericTypeError(name, comp, 'array', value));
      }

      return null;
    },
    onExpandChange: PropTypes__default['default'].func,
    defaultSelected: PropTypes__default['default'].string,
    selected: function selected(props, name, componentName, location) {
      var value = props[name];
      var comp = "`<" + componentName + ">`";

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

var Tree$1 = /*#__PURE__*/react.memo(Tree);

module.exports = Tree$1;
