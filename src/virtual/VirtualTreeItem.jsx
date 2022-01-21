import { memo } from 'react';

import { isFn, shallowEquals } from '../utils';

const VirtualTreeItem = ({
    measureRef,
    start,

    isExpanded,
    isSelected,

    tabIndex,
    level,
    positionInSet,
    setSize,

    index,

    renderLabel,
    onItemSelect,
    onKeyDown,

    ...props
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
                renderLabel(props, { isExpanded, isExpandable: props.nodes.length > 0 })
            ) : (
                <div onClick={() => onItemSelect(props)}>{props.label}</div>
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
