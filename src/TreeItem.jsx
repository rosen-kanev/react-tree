import React, { useContext } from 'react';

import TreeContext from './TreeContext';

const isFn = (value) => typeof value === 'function';

const TreeItem = (props) => {
    const { selected, focused, expanded, onItemSelect, renderLabel } = useContext(TreeContext);
    const isExpandable = props.nodes.length > 0;
    const isExpanded = isExpandable ? expanded.includes(props.id) : null;

    return (
        <li
            role="treeitem"
            tabIndex={focused === props.id ? 0 : -1}
            aria-expanded={isExpanded}
            aria-selected={selected === props.id ? true : null}
            data-id={`treeitem-${props.id}`}
        >
            {isFn(renderLabel) ? (
                renderLabel({
                    isExpanded,
                    isExpandable,
                    toggleItem() {
                        onItemSelect(props.id, isExpandable);
                    },
                    ...props,
                })
            ) : (
                <div onClick={() => onItemSelect(props.id, isExpandable)}>{props.label}</div>
            )}

            {isExpanded && isExpandable && (
                <ul role="group">
                    {props.nodes.map((node) => (
                        <TreeItem {...node} key={node.id} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default TreeItem;
