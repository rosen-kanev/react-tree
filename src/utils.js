export const noop = () => {};

export const isFn = (value) => typeof value === 'function';
export const isUndefined = (value) => typeof value === 'undefined';

export const getNodeIds = (nodes) => {
    const stack = [...nodes];
    const result = [];

    while (stack.length) {
        const node = stack.pop();

        result.push(node.id);
        stack.push(...node.nodes);
    }

    return result;
};

export const findNode = (nodes, id) => {
    const stack = [...nodes];

    while (stack.length) {
        const node = stack.pop();

        if (node.id === id) {
            return node;
        }

        stack.push(...node.nodes);
    }

    return null;
};

// shallow equals check, but without `expanded` and `onItemSelect`
export const shallowEquals = (prev, next) => {
    if (Object.is(prev, next)) {
        return true;
    }

    const keysPrev = Object.keys(prev).filter((key) => key !== 'expanded' && key !== 'onItemSelect');
    const keysNext = Object.keys(next).filter((key) => key !== 'expanded' && key !== 'onItemSelect');

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

export const propsAreEqual = (prev, next) => {
    const id = next.id;
    const areOtherPropsDifferent = !shallowEquals(prev, next);

    if (areOtherPropsDifferent) {
        return false;
    }

    if (prev.expanded.includes(id) !== next.expanded.includes(id)) {
        return false;
    }

    // We don't do a check if prev.expanded has children to update, because this node won't render any children.
    // This way we can skip the checks for it and its children - they won't render either way...
    if (next.expanded.includes(id)) {
        // this node has children that may need updates
        const children = getNodeIds(next.nodes);

        for (const child of children) {
            if (prev.expanded.includes(child) !== next.expanded.includes(child)) {
                // a child node needs to be updated
                return false;
            }
        }
    }

    return true;
};
