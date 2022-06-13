import { useState, forwardRef, useImperativeHandle, memo } from 'react';

import TreeItem from './TreeItem.jsx';

import useInternalState from '../useInternalState.js';
import basePropTypes from '../basePropTypes.js';

import { isLastTopLevelItem, getExpandState, getParentNode, getNodeAt, noop, isUndefined } from '../utils.js';

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
                setNeedsRefocus(true);
            },
        };
    });

    const [needsRefocus, setNeedsRefocus] = useState(false);

    const onKeyDown = (e) => {
        /* istanbul ignore next we test this, but the code coverage tool is still unconvinced */
        if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey || e.target !== e.currentTarget) {
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();

            if (e.currentTarget.dataset.index !== '0') {
                if (e.currentTarget.previousElementSibling) {
                    // move back a node and find the deepest leaf node
                    let item = e.currentTarget.previousElementSibling;

                    while (true) {
                        const { isExpanded, isExpandable } = getExpandState(item);

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

                    const node = getNodeAt(nodes, item.dataset.index);

                    focusTreeItem(node);
                } else {
                    // ├─ node_modules
                    // │  └─ @babel (next)
                    // │     ├─ code-frame (current)
                    // │     └─ compat-data
                    const parent = getParentNode(nodes, e.currentTarget.dataset.index);

                    if (parent) {
                        focusTreeItem(parent);
                    }
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();

            const { isExpanded } = getExpandState(e.currentTarget);

            if (isExpanded) {
                // ├─ node_modules (current)
                // │  └─ @babel (next)
                // │     ├─ code-frame
                // │     └─ compat-data
                // ├─ src
                const parent = getNodeAt(nodes, e.currentTarget.dataset.index);

                focusTreeItem(parent.nodes[0]);
            } else {
                let item = e.currentTarget;
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
                    if (isLastTopLevelItem(nodes, item.dataset.index)) {
                        // we are at the end of the tree
                        break;
                    }

                    if (item.nextElementSibling) {
                        item = item.nextElementSibling;
                        break;
                    }

                    item = item.parentElement.parentElement;
                }

                if (item !== e.currentTarget) {
                    focusTreeItem(getNodeAt(nodes, item.dataset.index));
                }
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();

            const { isExpandable, isExpanded } = getExpandState(e.currentTarget);

            if (isExpandable && isExpanded) {
                // ├─ src (current)
                // │ ├─ App.jsx
                // │ └─ data.js       -> ├─ src (next)
                // ├─ .editorconfig      ├─ .editorconfig
                // └─ .gitignore.js      └─ .gitignore.js
                const node = getNodeAt(nodes, e.currentTarget.dataset.index);

                setExpanded((prev) => prev.filter((id) => id !== node.id));
                onExpandChange(node);
            } else {
                // ├─ src (next)
                // │ ├─ App.jsx
                // │ └─ data.js (current)
                // ├─ .editorconfig
                // └─ .gitignore.js
                const parent = getParentNode(nodes, e.currentTarget.dataset.index);

                if (parent) {
                    focusTreeItem(parent);
                }
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();

            const { isExpandable, isExpanded } = getExpandState(e.currentTarget);

            if (isExpandable) {
                const node = getNodeAt(nodes, e.currentTarget.dataset.index);

                if (isExpanded) {
                    // ├─ src (current)
                    // │ ├─ App.jsx (next)
                    // │ └─ data.js
                    // ├─ .editorconfig
                    // └─ .gitignore.js
                    const next = node.nodes[0];

                    focusTreeItem(next);
                } else {
                    // ├─ src (current)      ├─ src (next)
                    // ├─ .editorconfig      │ ├─ App.jsx
                    // └─ .gitignore.js   -> │ └─ data.js
                    //                       ├─ .editorconfig
                    //                       └─ .gitignore.js
                    setExpanded((prev) => prev.concat(node.id));
                    onExpandChange(node);
                }
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();

            const node = getNodeAt(nodes, e.currentTarget.dataset.index);

            onItemSelect(node);
        }
    };

    const focusTreeItem = (node) => {
        if (node.id !== focused) {
            setCounter((prev) => prev + 1);
            setFocused(node.id);
            onFocusChange(node);

            if (selectionFollowsFocus) {
                setSelected(node.id);
                onSelectChange(node);
            }
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
                    key={node.id}
                    node={node}
                    index={`${index}`}
                    selected={selected}
                    focused={focused}
                    expanded={expanded}
                    setSize={nodes.length}
                    counter={counter}
                    needsRefocus={needsRefocus}
                    setNeedsRefocus={setNeedsRefocus}
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
