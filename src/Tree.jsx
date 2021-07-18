import React, { useRef, memo } from 'react';

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

export default memo(Tree);
