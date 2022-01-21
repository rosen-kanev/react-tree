import { useState, forwardRef, useImperativeHandle, memo } from 'react';

import TreeItem from './TreeItem.jsx';

import useInternalState from '../useInternalState.js';
import basePropTypes from '../basePropTypes.js';

import { moveUp, moveDown, moveLeft, moveRight, getNodeAt, noop, isUndefined } from '../utils.js';

/**
 * An accessible tree view component, based on the WAI-ARIA authoring practices for accessible widgets.
 *
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
const TreeImpl = (
    {
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
    },
    ref
) => {
    const initialFocus = isUndefined(focusedProp)
        ? isUndefined(defaultFocused) && nodes.length > 0
            ? nodes[0].id
            : defaultFocused
        : undefined;

    const [focused, setFocused] = useInternalState(focusedProp, initialFocus);
    const [expanded, setExpanded] = useInternalState(expandedProp, defaultExpanded);
    const [selected, setSelected] = useInternalState(selectedProp, defaultSelected);

    // hacky way to signal the currently `focused` TreeItem to call el.focus()
    const [counter, setCounter] = useState(0);

    useImperativeHandle(ref, () => {
        return {
            focus() {
                setCounter((prev) => prev + 1);
            },
        };
    });

    const onKeyDown = (e) => {
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
                setExpanded((prev) => prev.filter((id) => id !== node.id));
                onExpandChange(node);
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();

            const [item, node] = moveRight(e.currentTarget, nodes);

            if (item) {
                focusTreeItem(item, node);
            }

            if (!item && node) {
                setExpanded((prev) => prev.concat(node.id));
                onExpandChange(node);
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();

            const node = getNodeAt(nodes, e.currentTarget.dataset.index);

            onItemSelect(node);
        }
    };

    // @todo since the el.focus() call was moved to the TreeItem we no longer need the el
    const focusTreeItem = (el, node) => {
        setCounter((prev) => prev + 1);

        setFocused(node.id);
        onFocusChange(node);

        if (selectionFollowsFocus) {
            setSelected(node.id);
            onSelectChange(node);
        }
    };

    const onItemSelect = (node) => {
        if (selectionTogglesExpanded && node.nodes.length > 0) {
            setExpanded((prev) => {
                return prev.includes(node.id) ? prev.filter((id) => id !== node.id) : prev.concat(node.id);
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

    return (
        <ul role="tree" {...rest}>
            {nodes.map((node, index) => (
                <TreeItem
                    {...node}
                    key={node.id}
                    index={`${index}`}
                    selected={selected}
                    focused={focused}
                    expanded={expanded}
                    setSize={nodes.length}
                    counter={counter}
                    renderLabel={renderLabel}
                    onItemSelect={onItemSelect}
                    onKeyDown={onKeyDown}
                />
            ))}
        </ul>
    );
};

const Tree = forwardRef(TreeImpl);

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    Tree.displayName = 'Tree';
    Tree.propTypes = {
        ...basePropTypes,
    };
}

export default memo(Tree);
