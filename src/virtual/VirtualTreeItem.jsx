import { memo } from 'react';

import { isFn, shallowEquals } from '../utils';

const VirtualTreeItem = ({
    node,

    measureRef,
    start,

    isExpanded,
    isSelected,

    tabIndex,
    level,
    positionInSet,
    setSize,

    index,
    counter,
    isFocused,

    renderLabel,
    onItemSelect,
    onKeyDown,
}) => {
    return (
        <li
            ref={measureRef}
            role="treeitem"
            tabIndex={tabIndex}
            aria-expanded={isExpanded}
            aria-selected={isSelected || null}
            aria-level={level}
            aria-posinset={positionInSet}
            aria-setsize={setSize}
            data-index={index}
            style={{
                position: 'absolute',
                top: 0,
                transform: `translateY(${start}px)`,
                '--level': level,
            }}
            onKeyDown={onKeyDown}
        >
            {isFn(renderLabel) ? (
                renderLabel(node, { isExpanded, isExpandable: node.nodes.length > 0 })
            ) : (
                <div onClick={() => onItemSelect(node)}>{node.label}</div>
            )}
        </li>
    );
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    VirtualTreeItem.displayName = 'VirtualTreeItem';
}

const MemoVirtualTreeItem = memo(VirtualTreeItem, (prev, next) =>
    // ignore object identity of these props
    shallowEquals(prev, next, ['measureRef', 'onItemSelect', 'onKeyDown'])
);

export default MemoVirtualTreeItem;