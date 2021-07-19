import React from 'react';
import { render } from '@testing-library/react';
import cloneDeep from 'lodash.clonedeep';

import data from './data';
import Tree from '../src/Tree';

let fullTreeData;
let shallowTreeData; // 1 level deep
let basicTreeItem; // just one node

beforeEach(() => {
    fullTreeData = cloneDeep(data);
    shallowTreeData = fullTreeData.map(({ id, label }) => ({ id, label, nodes: [] }));
    basicTreeItem = {
        id: fullTreeData[0].id,
        label: fullTreeData[0].label,
        nodes: [],
    };
});

describe('a11y', () => {
    it('should render a single tree item with a simple string label', () => {
        const { queryByRole } = render(<Tree nodes={[basicTreeItem]} />);
        const treeitem = queryByRole('treeitem');

        expect(treeitem).toHaveTextContent(basicTreeItem.label);
    });

    it('should render a shallow tree', () => {
        const { queryAllByRole } = render(<Tree nodes={shallowTreeData} />);
        const treeitems = queryAllByRole('treeitem');

        expect(treeitems).toHaveLength(11);
    });

    it('should render a nested tree', () => {
        const { queryAllByRole } = render(
            <Tree nodes={fullTreeData} defaultExpanded={['1', '2', '3', '4', '9', '10', '25', '30', '42']} />
        );
        const treeitems = queryAllByRole('treeitem');

        expect(treeitems).toHaveLength(59);
    });
});
