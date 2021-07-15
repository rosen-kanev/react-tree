import React, { useRef, createContext } from 'react';

import TreeItem from './TreeItem';
import TreeContext from './TreeContext';
import useInternalState from './useInternalState';

const noop = () => {};

function Tree({
    nodes,

    defaultFocused,
    focused: focusedProp,
    onFocusChange = noop,

    defaultExpanded = [],
    expanded: expandedProp,
    onExpandChange = noop,

    defaultSelected,
    selected: selectedProp,
    onSelect = noop,

    renderLabel,
    ...rest
}) {
    const rootEl = useRef(null);
    const [focused, setFocused] = useInternalState({
        defaultValue: typeof defaultFocused === 'undefined' && nodes.length > 0 ? nodes[0].id : undefined,
        value: focusedProp,
        onChange: onFocusChange,
    });
    const [expanded, setExpanded] = useInternalState({
        defaultValue: defaultExpanded,
        value: expandedProp,
        onChange: onExpandChange,
    });
    const [selected, setSelected] = useInternalState({
        defaultValue: defaultSelected,
        value: selectedProp,
        onChange: onSelect,
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
            const type = nextNode.dataset.idType;

            setFocused(type === 'number' ? Number(id) : id);

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
            const type = item.dataset.idType;

            setFocused(type === 'number' ? Number(id) : id);
        }
    };

    return (
        <TreeContext.Provider value={{ selected, focused, expanded, onItemSelect, renderLabel }}>
            <ul ref={rootEl} role="tree" {...rest} onKeyDown={onKeyDown}>
                {nodes.map((node) => (
                    <TreeItem {...node} key={node.id} />
                ))}
            </ul>
        </TreeContext.Provider>
    );
}

export default Tree;
