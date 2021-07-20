import { createContext } from 'react';

const TreeContext = createContext({
    selected: null,
    focused: null,
    expanded: [],
    onItemSelect() {},
    renderLabel() {},
});

if (process.env.NODE_ENV !== 'production') {
    TreeContext.displayName = 'TreeContext';
}

export default TreeContext;
