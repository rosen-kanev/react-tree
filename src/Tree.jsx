import React, { useRef, createContext } from 'react';

import TreeItem from './TreeItem';
import TreeContext from './TreeContext';

function Tree({ nodes, selected, focused, onFocusChange, expanded, onExpandChange, onSelect, renderLabel, ...rest }) {
    const rootEl = useRef(null);

    const onItemSelect = (id, isExpandable) => {
        if (isExpandable) {
            onExpandChange(expanded.includes(id) ? expanded.filter((node) => node !== id) : expanded.concat(id));
        }

        onFocusChange(id);
        onSelect(id);
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
            // @todo this won't work correctly with ids that are plain old numbers
            const id = nextNode.dataset.id.replace('treeitem-', '');

            onFocusChange(id);

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
                onExpandChange(expanded.filter((node) => node !== focused));
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
                    onExpandChange(expanded.concat(focused));
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

            // @todo this won't work correctly with ids that are plain old numbers
            const id = item.dataset.id.replace('treeitem-', '');

            onFocusChange(id);
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
