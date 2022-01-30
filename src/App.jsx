import { useState, useCallback } from 'react';

import data from './data';

import VirtualTree from './virtual/VirtualTree';
import Tree from './regular/Tree';

const App = () => {
    const [nodes, setNodes] = useState(data);
    const [expanded, setExpanded] = useState([]);
    const [focused, setFocused] = useState(data[0].id);
    const [selected, setSelected] = useState(null);

    const renderLabel = useCallback(({ id, label }, { isExpanded, isExpandable }) => {
        return (
            <div
                onClick={() => {
                    setFocused(id);
                    setSelected(id);

                    if (isExpandable) {
                        setExpanded((prev) =>
                            prev.includes(id) ? prev.filter((node) => node !== id) : prev.concat(id)
                        );
                    }
                }}
            >
                {isExpandable && <span>{isExpanded ? '↓ ' : '→ '}</span>}

                {!isExpandable && '📄 '}

                {label}
            </div>
        );
    }, []);

    const onFocusChange = useCallback(({ id }) => {
        setFocused(id);
    }, []);

    const onExpandChange = useCallback(({ id }) => {
        setExpanded((prev) => (prev.includes(id) ? prev.filter((node) => node !== id) : prev.concat(id)));
    }, []);

    const onSelectChange = useCallback(({ id }) => {
        setSelected(id);
    }, []);

    return (
        <>
            {true && (
                <VirtualTree
                    className="virtual"
                    nodes={nodes}
                    focused={focused}
                    onFocusChange={onFocusChange}
                    expanded={expanded}
                    onExpandChange={onExpandChange}
                    selected={selected}
                    onSelectChange={onSelectChange}
                    renderLabel={renderLabel}
                />
            )}
            {false && (
                <Tree
                    className="vanilla"
                    nodes={nodes}
                    focused={focused}
                    onFocusChange={onFocusChange}
                    expanded={expanded}
                    onExpandChange={onExpandChange}
                    selected={selected}
                    onSelectChange={onSelectChange}
                    renderLabel={renderLabel}
                />
            )}
        </>
    );
};

export default App;
