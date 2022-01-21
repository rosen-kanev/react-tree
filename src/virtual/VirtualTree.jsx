import { useEffect, memo, useRef, useCallback, useMemo } from 'react';
import { useVirtual, defaultRangeExtractor } from 'react-virtual';
import PropTypes from 'prop-types';

import VirtualTreeItem from './VirtualTreeItem.jsx';

import useInternalState from '../useInternalState.js';
import { internalId, flattenData, getExpandState, getNodeAt, noop, isUndefined, isFn } from '../utils.js';
import basePropTypes from '../basePropTypes.js';

/**
 * An accessible tree view component, based on the WAI-ARIA authoring practices for accessible widgets.
 *
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
const VirtualTree = ({
    nodes,

    defaultFocused,
    focused: focusedProp,
    onFocusChange = noop,

    defaultExpanded = [],
    expanded: expandedProp,
    onExpandChange = noop,

    selectionTogglesExpanded = true,
    selectionFollowsFocus,
    shouldFocusElementOnFocusedChange = true,
    defaultSelected,
    selected: selectedProp,
    onSelectChange = noop,

    renderLabel,
    rowHeight = 30,
    ...rest
}) => {
    const initialFocus = isUndefined(focusedProp)
        ? isUndefined(defaultFocused) && nodes.length > 0
            ? nodes[0].id
            : defaultFocused
        : undefined;

    const [focused, setFocused] = useInternalState(focusedProp, initialFocus);
    const [expanded, setExpanded] = useInternalState(expandedProp, defaultExpanded);
    const [selected, setSelected] = useInternalState(selectedProp, defaultSelected);

    const isMounted = useRef(false);
    const parentRef = useRef();
    const flattened = useMemo(() => flattenData(nodes, expanded), [nodes, expanded]);

    const rowVirtualizer = useVirtual({
        estimateSize: useCallback(() => rowHeight, [rowHeight]),

        size: flattened.length,
        parentRef,

        // prerender the focused item, the one before it, after it, the parent item of the focused one
        rangeExtractor(range) {
            const defaultRange = defaultRangeExtractor(range);
            const focusedIndex = flattened.findIndex((node) => node.id === focused);

            if (focusedIndex === -1) {
                return defaultRange;
            } else {
                let range = new Set(defaultRange);

                const node = flattened[focusedIndex];
                const path = node[internalId].split('-');
                const parent = path.length > 1 ? getNodeAt(nodes, path.slice(0, -1).join('-')) : null;

                if (parent) {
                    range.add(flattened.findIndex((node) => node.id === parent.id));
                }

                if (focusedIndex > 0) {
                    range.add(focusedIndex - 1);
                }

                range.add(focusedIndex);

                if (focusedIndex < flattened.length - 1) {
                    range.add(focusedIndex + 1);
                }

                return [...range];
            }
        },
    });

    // @todo we should mimic the same API from Tree
    useEffect(() => {
        const hasMounted = isMounted.current;

        if (!isMounted.current) {
            isMounted.current = true;
        }

        if (hasMounted && shouldFocusElementOnFocusedChange) {
            const index = flattened.findIndex((node) => node.id === focused);
            const node = flattened[index];

            rowVirtualizer.scrollToIndex(index);
            parentRef.current.querySelector(`[data-index="${node[internalId]}"]`)?.focus();
        }
    }, [focused]);

    const focusTreeItem = (node) => {
        if (node.id !== focused) {
            setFocused(node.id);
            onFocusChange(node);
        }

        if (selectionFollowsFocus) {
            if (node.id !== selected) {
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

        if (node.id !== selected) {
            setSelected(node.id);
            onSelectChange(node);
        }
    };

    const onKeyDown = (e) => {
        /* istanbul ignore next we test this, but the code coverage tool is still unconvinced */
        if (!nodes.length || e.altKey || e.ctrlKey || e.metaKey || e.target !== e.currentTarget) {
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();

            if (flattened[0].id !== focused) {
                const index = flattened.findIndex((node) => node.id === focused);
                const nextIndex = index - 1;
                const node = flattened[nextIndex];

                focusTreeItem(node);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();

            if (flattened[flattened.length - 1].id !== focused) {
                const index = flattened.findIndex((node) => node.id === focused);
                const nextIndex = index + 1;
                const node = flattened[nextIndex];

                focusTreeItem(node);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();

            const { isExpandable, isExpanded } = getExpandState(e.currentTarget);

            if (isExpandable && isExpanded) {
                const index = flattened.findIndex((node) => node.id === focused);
                const node = flattened[index];

                setExpanded((prev) => prev.filter((id) => id !== node.id));
                onExpandChange(node);

                focusTreeItem(node);
            } else {
                const path = e.currentTarget.dataset.index.split('-');

                if (path.length > 1) {
                    const parentNode = getNodeAt(nodes, path.slice(0, -1).join('-'));
                    const index = flattened.findIndex((node) => node.id === parentNode.id);
                    const node = flattened[index]; // we do this, because parentNode doesn't have node[internalId]

                    focusTreeItem(node);
                }
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();

            const { isExpandable, isExpanded } = getExpandState(e.currentTarget);

            if (isExpandable) {
                if (isExpanded) {
                    const childNode = getNodeAt(nodes, e.currentTarget.dataset.index).nodes[0];

                    const index = flattened.findIndex((node) => node.id === childNode.id);
                    const node = flattened[index]; // we do this, because childNode doesn't have node[internalId]

                    focusTreeItem(node);
                } else {
                    const index = flattened.findIndex((node) => node.id === focused);
                    const node = flattened[index];

                    setExpanded((prev) => prev.concat(node.id));
                    onExpandChange(node);

                    focusTreeItem(node);
                }
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();

            const node = getNodeAt(nodes, e.currentTarget.dataset.index);

            onItemSelect(node);
        }
    };

    const treeStyles = useMemo(() => {
        return {
            height: rowVirtualizer.totalSize + 'px',
            position: 'relative',
            margin: 0,
            padding: 0,
        };
    }, [rowVirtualizer.totalSize]);

    return (
        <div {...rest} ref={parentRef}>
            <ul role="tree" style={treeStyles}>
                {rowVirtualizer.virtualItems.map((virtualRow) => {
                    const node = flattened[virtualRow.index];

                    const path = node[internalId].split('-');

                    const level = path.length;
                    const positionInSet = parseInt(path[path.length - 1], 10) + 1;
                    const setSize =
                        path.length === 1 ? nodes.length : getNodeAt(nodes, path.slice(0, -1).join('-')).nodes.length;

                    const isExpandable = node.nodes.length > 0;
                    const isExpanded = isExpandable ? expanded.includes(node.id) : null;

                    return (
                        <VirtualTreeItem
                            {...node}
                            key={virtualRow.index}
                            measureRef={virtualRow.measureRef}
                            start={virtualRow.start}
                            isExpanded={isExpanded}
                            isSelected={selected === node.id}
                            tabIndex={focused === node.id ? 0 : -1}
                            level={level}
                            positionInSet={positionInSet}
                            setSize={setSize}
                            index={node[internalId]}
                            renderLabel={renderLabel}
                            onItemSelect={onItemSelect}
                            onKeyDown={onKeyDown}
                        />
                    );
                })}
            </ul>
        </div>
    );
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
    VirtualTree.displayName = 'VirtualTree';
    VirtualTree.propTypes = {
        ...basePropTypes,
    };
}

export default memo(VirtualTree);
