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

it('should render a single item', () => {
    const { queryByRole } = render(<Tree nodes={[basicTreeItem]} />);
    const treeitem = queryByRole('treeitem');

    expect(treeitem).toHaveTextContent(basicTreeItem.label);
});
