import React from 'react';

import { propsAreEqual, isFn } from './utils';

const TreeItem = ({ onItemSelect, renderLabel, expanded, ...props }) => {
    const isExpandable = props.nodes.length > 0;
    const isExpanded = isExpandable ? expanded.includes(props.id) : null;

    return (
        <li role="treeitem" tabIndex={-1} aria-expanded={isExpanded} data-id={`treeitem-${props.id}`}>
            {isFn(renderLabel) ? (
                renderLabel({
                    ...props,
                    isExpanded,
                    isExpandable,
                    toggleItem() {
                        onItemSelect(props.id, isExpandable);
                    },
                })
            ) : (
                <div onClick={() => onItemSelect(props.id, isExpandable)}>{props.label}</div>
            )}

            {isExpanded && isExpandable && (
                <ul role="group">
                    {props.nodes.map((node) => (
                        <MemoTreeItem
                            {...node}
                            expanded={expanded}
                            onItemSelect={onItemSelect}
                            renderLabel={renderLabel}
                            key={node.id}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    TreeItem.displayName = 'TreeItem';
}

const MemoTreeItem = React.memo(TreeItem, propsAreEqual);

export default MemoTreeItem;
