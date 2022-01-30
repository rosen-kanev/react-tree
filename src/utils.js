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

export const moveUp = (current, nodes) => {
    if (current.dataset.index === '0') {
        // we are at the start of the tree
        return [null, null];
    }

    if (current.previousElementSibling) {
        // move back a node and find the deepest leaf node
        let item = current.previousElementSibling;

        while (true) {
            const { isExpanded, isExpandable } = getExpandState(item);

            if (isExpandable && isExpanded) {
                // ├─ node_modules
                // │  └─ @babel
                // │     ├─ code-frame
                // │     └─ compat-data (next)
                // ├─ src (current)
                item = item.lastElementChild.lastElementChild;
            } else {
                break;
            }
        }

        return [item, getNodeAt(nodes, item.dataset.index)];
    } else {
        // ├─ node_modules
        // │  └─ @babel (next)
        // │     ├─ code-frame (current)
        // │     └─ compat-data
        return moveToParent(current, nodes);
    }
};

export const moveDown = (current, nodes) => {
    let item = current;
    const { isExpanded } = getExpandState(current);

    if (isExpanded) {
        // ├─ node_modules (current)
        // │  └─ @babel (next)
        // │     ├─ code-frame
        // │     └─ compat-data
        // ├─ src
        item = current.lastElementChild.firstElementChild;
    } else {
        // go to parent and find its next sibling until we find a node or reach the end of the tree
        // ├─ node_modules
        // │  └─ @babel
        // │     ├─ code-frame
        // │     └─ compat-data (current)
        // ├─ src (next)
        while (true) {
            // ├─ node_modules
            // │  └─ @babel
            // │     ├─ code-frame
            // │     └─ compat-data (current)
            if (isLastItem(item, nodes)) {
                // we are at the end of the tree
                return [null, null];
            }

            if (item.nextElementSibling) {
                item = item.nextElementSibling;
                break;
            }

            item = item.parentElement.parentElement;
        }
    }

    return [item, getNodeAt(nodes, item.dataset.index)];
};

export const moveLeft = (current, nodes) => {
    const { isExpandable, isExpanded } = getExpandState(current);
    const index = current.dataset.index;

    if (isExpandable && isExpanded) {
        // ├─ src (current)
        // │ ├─ App.jsx
        // │ └─ data.js       -> ├─ src (next)
        // ├─ .editorconfig      ├─ .editorconfig
        // └─ .gitignore.js      └─ .gitignore.js
        return [null, getNodeAt(nodes, index)];
    } else {
        // ├─ src (next)
        // │ ├─ App.jsx
        // │ └─ data.js (current)
        // ├─ .editorconfig
        // └─ .gitignore.js
        return moveToParent(current, nodes);
    }
};

export const moveRight = (current, nodes) => {
    const { isExpandable, isExpanded } = getExpandState(current);

    if (isExpandable) {
        const index = current.dataset.index;
        const node = getNodeAt(nodes, index);

        if (isExpanded) {
            // ├─ src (current)
            // │ ├─ App.jsx (next)
            // │ └─ data.js
            // ├─ .editorconfig
            // └─ .gitignore.js
            const item = current.lastElementChild.firstElementChild;
            const next = node.nodes[0];

            return [item, next];
        } else {
            // ├─ src (current)      ├─ src (next)
            // ├─ .editorconfig      │ ├─ App.jsx
            // └─ .gitignore.js   -> │ └─ data.js
            //                       ├─ .editorconfig
            //                       └─ .gitignore.js
            return [null, node];
        }
    }

    // ├─ src
    // │ ├─ App.jsx
    // │ └─ data.js
    // ├─ .editorconfig (current)
    // └─ .gitignore.js
    return [null, null];
};

const moveToParent = (current, nodes) => {
    const path = current.dataset.index.split('-');

    if (path.length > 1) {
        const item = current.parentElement.parentElement;

        return [item, getNodeAt(nodes, item.dataset.index)];
    }

    return [null, null];
};

export const getExpandState = (node) => {
    const ariaExpandedAttribute = node.getAttribute('aria-expanded');

    return {
        isExpandable: ariaExpandedAttribute !== null,
        isExpanded: ariaExpandedAttribute === 'true',
    };
};

const isLastItem = (item, nodes) => {
    const path = item.dataset.index.split('-');

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
            // console.log(key, 'changed', prev[key], next[key]);
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
