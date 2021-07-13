import { createContext } from 'react';

const TreeContext = createContext({
    selected: null,
    focused: null,
    expanded: [],
    onItemSelect() {},
    renderLabel() {},
});

TreeContext.displayName = 'TreeContext';

export default TreeContext;
