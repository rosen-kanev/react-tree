import React, { useRef, memo } from 'react';
import PropTypes from 'prop-types';

import TreeItem from './TreeItem.jsx';
import TreeContext from './TreeContext.js';
import useInternalState from './useInternalState.js';

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
    const rootEl = useRef(null);
    const [focused, setFocused] = useInternalState({
        defaultValue: typeof defaultFocused === 'undefined' && nodes.length > 0 ? nodes[0].id : undefined,
        value: focusedProp,
        onChange: typeof onFocusChange === 'function' ? onFocusChange : noop,
    });
    const [expanded, setExpanded] = useInternalState({
        defaultValue: defaultExpanded,
        value: expandedProp,
        onChange: typeof onExpandChange === 'function' ? onExpandChange : noop,
    });
    const [selected, setSelected] = useInternalState({
        defaultValue: defaultSelected,
        value: selectedProp,
        onChange: typeof onSelectChange === 'function' ? onSelectChange : noop,
    });

    const onItemSelect = (id, isExpandable) => {
        if (isExpandable) {
            setExpanded(expanded.includes(id) ? expanded.filter((node) => node !== id) : expanded.concat(id));
        }

        setFocused(id);
        setSelected(id);
    };

    const moveToTreeItem = (isPrev) => {
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
            nextNode.firstElementChild.scrollIntoView({ block: 'center' });
        }
    };

    const onKeyDown = (e) => {
        if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();

            // move to previous node that is visible on the screen
            moveToTreeItem(true);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();

            // move to next node that is visible on the screen
            moveToTreeItem(false);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();

            const { treeItem, isExpandable, isExpanded } = getTreeItem(focused);

            if (isExpandable && isExpanded) {
                // close node
                setExpanded(expanded.filter((node) => node !== focused));
            } else {
                // move focus to parent node
                focusItem(treeItem.closest('[role="treeitem"]:not([tabindex="0"])'));
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();

            const { treeItem, isExpandable, isExpanded } = getTreeItem(focused);

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

            const isExpandable = rootEl.current
                .querySelector(`[data-id="treeitem-${focused}"]`)
                .hasAttribute('aria-expanded');

            onItemSelect(focused, isExpandable);
        }
    };

    const getTreeItem = (id) => {
        const treeItem = rootEl.current.querySelector(`[data-id="treeitem-${id}"]`);

        return {
            treeItem,
            isExpandable: treeItem.hasAttribute('aria-expanded'),
            isExpanded: treeItem.getAttribute('aria-expanded') === 'true',
        };
    };

    const focusItem = (item) => {
        if (item) {
            item.focus();
            item.firstElementChild.scrollIntoView({ block: 'center' });

            const id = item.dataset.id.replace('treeitem-', '');

            setFocused(id);
        }
    };

    return (
        <TreeContext.Provider value={{ selected, focused, expanded, onItemSelect, renderLabel }}>
            <ul role="tree" onKeyDown={onKeyDown} {...rest} ref={rootEl}>
                {nodes.map((node) => (
                    <TreeItem {...node} key={node.id} />
                ))}
            </ul>
        </TreeContext.Provider>
    );
};

if (process.env.NODE_ENV !== 'production') {
    const getErrorForControlled = (propName, componentName, handlerName, defaultPropName) => {
        return (
            `You provided a \`${propName}\` prop to ${componentName} without an \`${handlerName}\` handler. ` +
            `This will cause the ${componentName} component to behave incorrectly. ` +
            `If the ${componentName} should be mutable use \`${defaultPropName}\` instead. Otherwise, set \`${handlerName}\`.`
        );
    };

    const getErrorForUncontrolled = (propName, componentName, handlerName, defaultPropName) => {
        return (
            `You provided a \`${propName}\` prop as well as a \`${defaultPropName}\` prop to ${componentName}. ` +
            `If you want a controlled component, use the \`${propName}\` prop with an \`${handlerName}\` handler. ` +
            `If you want an uncontrolled component, remove the \`${propName}\` prop and use \`${defaultPropName}\` instead.`
        );
    };

    const getGenericTypeError = (name, componentName, expectedType, value) => {
        return `Invalid prop \`${name}\` supplied to ${componentName}. Expected \`${expectedType}\`, received \`${
            Array.isArray(value) ? 'array' : typeof value
        }\`.`;
    };

    let nodeShape = {
        id: PropTypes.string.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    };
    nodeShape.nodes = PropTypes.arrayOf(PropTypes.shape(nodeShape));

    Tree.displayName = 'Tree';
    Tree.propTypes = {
        nodes: PropTypes.arrayOf(PropTypes.shape(nodeShape)).isRequired,

        defaultFocused: PropTypes.string,
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
        onFocusChange: PropTypes.func,

        defaultExpanded: PropTypes.arrayOf(PropTypes.string),
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

                return value.some((i) => typeof i !== 'string') ? new Error(message) : null;
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

        renderLabel: PropTypes.func,
    };
}

export default memo(Tree);
