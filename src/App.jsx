import React, { useState, useCallback } from 'react';

import data from './data';

import Tree from './Tree';

const App = () => {
    const [nodes, setNodes] = useState(data);
    const [expanded, setExpanded] = useState([]);
    const [focused, setFocused] = useState(data[0].id);
    const [selected, setSelected] = useState(null);

    const renderLabel = useCallback(({ id, isExpandable, isExpanded, label, toggleItem }) => {
        return (
            <div onClick={toggleItem}>
                {isExpandable && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((prev) =>
                                prev.includes(id) ? prev.filter((node) => node !== id) : prev.concat(id)
                            );
                            setFocused(id);
                        }}
                    >
                        {isExpanded ? '↓ ' : '→ '}
                    </span>
                )}

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
        <div>
            <Tree
                nodes={nodes}
                focused={focused}
                onFocusChange={onFocusChange}
                expanded={expanded}
                onExpandChange={onExpandChange}
                selected={selected}
                onSelectChange={onSelectChange}
                renderLabel={renderLabel}
                expandOnSelect={false}
            />
        </div>
    );
};

export default App;
