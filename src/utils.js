export const noop = () => {};

export const isFn = (value) => typeof value === 'function';
export const isUndefined = (value) => typeof value === 'undefined';

export const getNodeAt = (nodes, index) => {
    const path = index.split('-');
    let node = { nodes };
    let i = 0;

    while (node != null && i < path.length) {
        node = node.nodes[path[i++]];
    }

    return i && i === path.length ? node : undefined;
};

export const getParentNode = (nodes, index) => {
    const path = index.split('-');

    return path.length > 1 ? getNodeAt(nodes, path.slice(0, -1).join('-')) : null;
};

export const getExpandState = (el) => {
    const ariaExpandedAttribute = el.getAttribute('aria-expanded');

    return {
        isExpandable: ariaExpandedAttribute !== null,
        isExpanded: ariaExpandedAttribute === 'true',
    };
};

export const isLastTopLevelItem = (nodes, index) => {
    const path = index.split('-');

    return path.length === 1 && parseInt(path[0], 10) === nodes.length - 1;
};

export const shallowEquals = (prev, next, ignored) => {
    if (Object.is(prev, next)) {
        return true;
    }

    const keysPrev = Object.keys(prev).filter((key) => !ignored.includes(key));
    const keysNext = Object.keys(next).filter((key) => !ignored.includes(key));

    if (keysPrev.length !== keysNext.length) {
        return false;
    }

    for (const key of keysPrev) {
        if (!Object.prototype.hasOwnProperty.call(next, key) || !Object.is(prev[key], next[key])) {
            return false;
        }
    }

    return true;
};

export const internalId = Symbol('id');

export const addInternalIds = (nodes, parentId) => {
    let result = [];
    let i = nodes.length - 1;

    while (i >= 0) {
        result.push({
            ...nodes[i],
            [internalId]: parentId ? `${parentId}-${i}` : `${i}`,
        });

        i--;
    }

    return result;
};

export const flattenData = (nodes, expanded) => {
    const stack = addInternalIds(nodes, '');
    const tree = [];

    while (stack.length) {
        const node = stack.pop();

        tree.push(node);

        if (expanded.includes(node.id)) {
            stack.push(...addInternalIds(node.nodes, node[internalId]));
        }
    }

    return tree;
};
