import React, { useState, useCallback } from 'react';

import data from './data';

import Tree from './Tree';

const App = () => {
    const [nodes, setNodes] = useState(data);
    const [expanded, setExpanded] = useState([]);
    const [focused, setFocused] = useState(data[0].id);
    const [selected, setSelected] = useState(null);

    const renderLabel = useCallback(({ isExpandable, label, toggleItem }) => {
        return (
            <div onClick={toggleItem}>
                {isExpandable ? (
                    <>
                        <span className="arrow-down">{'↓ '}</span>
                        <span className="arrow-right">{'→ '}</span>
                    </>
                ) : (
                    '📄 '
                )}

                <span>{label}</span>
            </div>
        );
    }, []);

    return (
        <div>
            <Tree
                nodes={nodes}
                focused={focused}
                onFocusChange={setFocused}
                expanded={expanded}
                onExpandChange={setExpanded}
                selected={selected}
                onSelectChange={setSelected}
                renderLabel={renderLabel}
            />
        </div>
    );
};

export default App;
