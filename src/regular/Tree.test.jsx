import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import cloneDeep from 'lodash.clonedeep';

import data from './data';
import Tree from '../src/Tree';

let fullTreeData;
let shallowTreeData; // 1 level deep
let basicTreeItem; // just one node

let scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

beforeEach(() => {
    fullTreeData = cloneDeep(data);
    shallowTreeData = fullTreeData.map(({ id, label }) => ({ id, label, nodes: [] }));
    basicTreeItem = {
        id: fullTreeData[0].id,
        label: fullTreeData[0].label,
        nodes: [],
    };
});

describe('render', () => {
    test('single tree item with a simple string label', () => {
        const { queryByRole } = render(<Tree nodes={[basicTreeItem]} />);
        const treeitem = queryByRole('treeitem');

        expect(treeitem).toHaveTextContent(basicTreeItem.label);
    });

    test('shallow tree', () => {
        const { queryAllByRole } = render(<Tree nodes={shallowTreeData} />);
        const treeitems = queryAllByRole('treeitem');

        expect(treeitems).toHaveLength(11);
    });

    test('nested tree', () => {
        const { queryAllByRole } = render(
            <Tree nodes={fullTreeData} defaultExpanded={['1', '2', '3', '4', '9', '10', '25', '30', '42']} />
        );
        const treeitems = queryAllByRole('treeitem');

        expect(treeitems).toHaveLength(59);
    });

    test('custom label', () => {
        const { queryByTestId } = render(
            <Tree
                nodes={[basicTreeItem]}
                renderLabel={(props) => <div data-testid="my-custom-label">{props.label}</div>}
            />
        );
        const label = queryByTestId('my-custom-label');

        expect(label).not.toBeNull();
    });

    test('pass on className', () => {
        const { queryByRole } = render(<Tree className="hello" nodes={shallowTreeData} />);
        const tree = queryByRole('tree');

        expect(tree.classList.contains('hello')).toBe(true);
    });

    test('pass on arbitrary data attributes', () => {
        const { queryByTestId } = render(<Tree data-testid="hello" nodes={shallowTreeData} />);

        expect(queryByTestId('hello')).not.toBeNull();
    });
});

describe('focus management', () => {
    test('controlled component', () => {
        const node = shallowTreeData[0];
        const setFocusedMock = jest.fn();
        const { container } = render(<Tree nodes={shallowTreeData} focused={node.id} onFocusChange={setFocusedMock} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });

        expect(setFocusedMock).toHaveBeenCalledWith(shallowTreeData[1]);
    });

    test('uncontrolled component', () => {
        const node = shallowTreeData[0];
        const nextNode = shallowTreeData[1];
        const { container } = render(<Tree nodes={shallowTreeData} defaultFocused={node.id} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });

        const treeitem = container.querySelector('[tabindex="0"]');
        expect(treeitem).toHaveAttribute('data-id', `treeitem-${nextNode.id}`);
    });
});

describe('expanded management', () => {
    test('controlled component', async () => {
        const node = fullTreeData[0];
        const setExpandedMock = jest.fn();
        const { container, findByRole } = render(
            <Tree nodes={fullTreeData} expanded={[]} onExpandChange={setExpandedMock} />
        );

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'Enter' });

        expect(setExpandedMock).toHaveBeenCalledWith(node);
    });

    test('uncontrolled component', () => {
        const node = fullTreeData[1];
        const { container } = render(<Tree nodes={fullTreeData} defaultExpanded={[node.id]} />);
        const elements = container.querySelectorAll('[aria-expanded="true"]');

        expect(elements.length).toBe(1);
        expect(elements[0]).toHaveAttribute('data-id', `treeitem-${node.id}`);
    });
});

describe('selected management', () => {
    test('controlled component', () => {
        const node = shallowTreeData[0];
        const setSelectedMock = jest.fn();
        const { container } = render(
            <Tree nodes={shallowTreeData} selected={node.id} onSelectChange={setSelectedMock} />
        );

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
        fireEvent.keyDown(document.activeElement, { key: 'Enter' });

        expect(setSelectedMock).toHaveBeenCalledWith(shallowTreeData[1]);
    });

    test('uncontrolled component', () => {
        const node = shallowTreeData[1];
        const { container } = render(<Tree nodes={shallowTreeData} defaultSelected={node.id} />);
        const elements = container.querySelectorAll('[aria-selected="true"]');

        expect(elements.length).toBe(1);
        expect(elements[0]).toHaveAttribute('data-id', `treeitem-${node.id}`);
    });
});

describe('events', () => {
    test('moves focus from first to second item on ArrowDown', () => {
        const node = shallowTreeData[0];
        const nextNode = shallowTreeData[1];
        const { container } = render(<Tree nodes={shallowTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });

        const nextElement = container.querySelector('[tabindex="0"]');
        expect(nextElement).toHaveAttribute('data-id', `treeitem-${nextNode.id}`);
    });

    test("doesn't change the focus while on last item on ArrowDown", () => {
        const node = shallowTreeData[shallowTreeData.length - 1];
        const { container } = render(<Tree nodes={shallowTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });

        expect(element).toHaveAttribute('tabindex', '0');
    });

    test('moves focus from second to first item on ArrowUp', () => {
        const node = shallowTreeData[1];
        const nextNode = shallowTreeData[0];
        const { container } = render(<Tree nodes={shallowTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });

        const nextElement = container.querySelector('[tabindex="0"]');
        expect(nextElement).toHaveAttribute('data-id', `treeitem-${nextNode.id}`);
    });

    test("doesn't change the focus while on first item on ArrowUp", () => {
        const node = shallowTreeData[0];
        const { container } = render(<Tree nodes={shallowTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });

        expect(element).toHaveAttribute('tabindex', '0');
    });

    test('expands the collapsed parent item on ArrowRight', () => {
        const node = fullTreeData[0];
        const { container } = render(<Tree nodes={fullTreeData} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });

        expect(element).toHaveAttribute('aria-expanded', 'true');
    });

    test("doesn't move the focus when on non-expandable item on ArrowRight", () => {
        const node = fullTreeData[fullTreeData.length - 1];
        const { container, debug } = render(<Tree nodes={fullTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });

        expect(element).toHaveAttribute('tabindex', '0');
    });

    test('moves focus to first child of the currently focused parent item on ArrowRight', () => {
        const node = fullTreeData[0];
        const { container } = render(<Tree nodes={fullTreeData} defaultExpanded={[node.id]} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });

        const child = container.querySelector('[tabindex="0"]');
        expect(child).toHaveAttribute('tabindex', '0');
    });

    test('collapses the expanded parent item on ArrowLeft', () => {
        const node = fullTreeData[0];
        const { container } = render(
            <Tree nodes={fullTreeData} defaultExpanded={[node.id]} defaultFocused={node.id} />
        );
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });

        expect(element).toHaveAttribute('aria-expanded', 'false');
    });

    test('when focus is on collapsed item the focus moves to the parent item on ArrowLeft', () => {
        const parentNode = fullTreeData[0];
        const childNode = fullTreeData[0].nodes[0];
        const { container } = render(
            <Tree nodes={fullTreeData} defaultExpanded={[parentNode.id]} defaultFocused={childNode.id} />
        );
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });

        const treeitem = container.querySelector(`[data-id="treeitem-${parentNode.id}"]`);
        expect(treeitem).toHaveAttribute('tabindex', '0');
    });

    test("doesn't move the focus when on root item on ArrowLeft", () => {
        const node = fullTreeData[0];
        const { container } = render(<Tree nodes={fullTreeData} defaultFocused={node.id} />);
        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });

        const treeitem = container.querySelector(`[data-id="treeitem-${node.id}"]`);
        expect(treeitem).toHaveAttribute('tabindex', '0');
    });

    test('changes the selected item on click', () => {
        const node = shallowTreeData[0];
        const nodeToSelect = shallowTreeData[1];
        const { container, debug } = render(<Tree nodes={shallowTreeData} defaultSelected={node.id} />);

        const treeitem = container.querySelector(`[data-id="treeitem-${nodeToSelect.id}"]`);
        const treeitemLabel = container.querySelector(`[data-id="treeitem-${nodeToSelect.id}"] > div`);

        fireEvent.click(treeitemLabel);

        expect(treeitem).toHaveAttribute('aria-selected', 'true');
    });

    test('when using a custom label it changes the selected item on click', () => {
        const node = shallowTreeData[0];
        const nodeToSelect = shallowTreeData[1];
        const { container, debug } = render(
            <Tree
                nodes={shallowTreeData}
                renderLabel={(props) => (
                    <div onClick={() => props.toggleItem()} data-testid="my-custom-label">
                        {props.label}
                    </div>
                )}
            />
        );

        const treeitem = container.querySelector(`[data-id="treeitem-${nodeToSelect.id}"]`);
        const treeitemLabel = container.querySelector(`[data-id="treeitem-${nodeToSelect.id}"] > div`);

        fireEvent.click(treeitemLabel);

        expect(treeitem).toHaveAttribute('aria-selected', 'true');
    });

    test('changes the selected item on Enter', () => {
        const node = shallowTreeData[0];
        const { container } = render(<Tree nodes={shallowTreeData} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'Enter' });

        expect(element).toHaveAttribute('aria-selected', 'true');
    });

    test('expands the item on Enter', () => {
        const node = fullTreeData[0];
        const { container } = render(<Tree nodes={fullTreeData} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'Enter' });

        expect(element).toHaveAttribute('aria-expanded', 'true');
    });

    test('collapses the item on Enter', () => {
        const node = fullTreeData[0];
        const { container } = render(<Tree nodes={fullTreeData} defaultExpanded={[node.id]} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 'Enter' });

        expect(element).toHaveAttribute('aria-expanded', 'false');
    });

    test('changes the selected item on Space', () => {
        const node = shallowTreeData[0];
        const { container } = render(<Tree nodes={shallowTreeData} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: ' ' });

        expect(element).toHaveAttribute('aria-selected', 'true');
    });

    test("doesn't move the focus when you press the S key", () => {
        const node = shallowTreeData[0];
        const { container } = render(<Tree nodes={shallowTreeData} />);

        const element = container.querySelector('[tabindex="0"]');

        element.focus();
        fireEvent.keyDown(document.activeElement, { key: 's' });

        expect(element).toHaveAttribute('tabindex', '0');
    });
});
