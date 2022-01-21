import { useRef, useEffect, memo } from 'react';

import { isFn, shallowEquals } from '../utils';

const TreeItem = ({
    onItemSelect,
    renderLabel,
    focused,
    selected,
    expanded,
    index,
    setSize,
    counter,
    onKeyDown,
    ...props
}) => {
    const isExpandable = props.nodes.length > 0;
    const isExpanded = isExpandable ? expanded.includes(props.id) : null;

    const path = index.split('-');
    const positionInSet = parseInt(path[path.length - 1], 10) + 1;

    const el = useRef();

    useEffect(() => {
        if (counter > 0 && focused === props.id) {
            if (el.current) {
                el.current.focus();
                el.current.firstElementChild.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [counter]);

    return (
        <li
            ref={el}
            role="treeitem"
            tabIndex={focused === props.id ? 0 : -1}
            aria-expanded={isExpanded}
            aria-selected={selected === props.id || null}
            aria-level={path.length}
            aria-posinset={positionInSet}
            aria-setsize={setSize}
            data-index={index}
            onKeyDown={onKeyDown}
        >
            {isFn(renderLabel) ? (
                renderLabel(props, { isExpandable, isExpanded })
            ) : (
                <div onClick={() => onItemSelect(props)}>{props.label}</div>
            )}

            {isExpanded && isExpandable && (
                <ul role="group">
                    {props.nodes.map((node, childIndex) => (
                        <MemoTreeItem
                            {...node}
                            key={node.id}
                            index={index + '-' + childIndex}
                            selected={selected}
                            focused={focused}
                            expanded={expanded}
                            setSize={props.nodes.length}
                            counter={counter}
                            renderLabel={renderLabel}
                            onItemSelect={onItemSelect}
                            onKeyDown={onKeyDown}
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

const propsAreEqual = (prev, next) => {
    // ignore object identity of these props
    const ignored = ['counter', 'selected', 'focused', 'expanded', 'onItemSelect', 'onKeyDown'];
    const areOtherPropsDifferent = !shallowEquals(prev, next, ignored);

    if (areOtherPropsDifferent) {
        // other props are different - trigger a rerender
        return false;
    }

    // breadth first traverse - when working with file system like trees the user usually starts from the outer nodes
    // and most of the tree changes will be happening near the root of the tree
    const stack = [{ ...next, nodes: [] }, ...next.nodes];

    while (stack.length) {
        const node = stack.shift();

        if (node.id === next.focused || node.id === prev.focused) {
            // a node or one of its children has to change its `tabIndex` - trigger a rerender
            return false;
        }

        if (node.id === next.selected || node.id === prev.selected) {
            // a node or one of its children has to change its `aria-selected` - trigger a rerender
            return false;
        }

        if (prev.expanded.includes(node.id) !== next.expanded.includes(node.id)) {
            // a node or one of its children has to be collapsed/expanded - trigger a rerender
            return false;
        }

        stack.push(...node.nodes);
    }

    return true;
};

const MemoTreeItem = memo(TreeItem, propsAreEqual);

export default MemoTreeItem;
