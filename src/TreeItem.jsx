import React, { memo } from 'react';

import TreeContext from './TreeContext';

const isFn = (value) => typeof value === 'function';

const TreeItem = ({ onItemSelect, renderLabel, ...props }) => {
    const isExpandable = props.nodes.length > 0;

    return (
        <li role="treeitem" tabIndex={-1} data-expandable={isExpandable ? '' : null} data-id={`treeitem-${props.id}`}>
            {isFn(renderLabel) ? (
                renderLabel({
                    ...props,
                    isExpandable,
                    toggleItem() {
                        onItemSelect(props.id, isExpandable);
                    },
                })
            ) : (
                <div onClick={() => onItemSelect(props.id, isExpandable)}>{props.label}</div>
            )}

            {isExpandable && (
                <ul role="group">
                    {props.nodes.map((node) => (
                        <TreeItem {...node} onItemSelect={onItemSelect} renderLabel={renderLabel} key={node.id} />
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

export default memo(TreeItem);
