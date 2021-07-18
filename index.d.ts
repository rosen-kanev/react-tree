import { ReactNode, ReactElement, NamedExoticComponent, ComponentPropsWithoutRef } from 'react';

type Node = {
    id: string;
    label: ReactNode;
    nodes: Node[];
};

type RenderLabelArgs = Node & {
    isExpanded: boolean;
    isExpandable: boolean;
    toggleItem(): void;
};

type Props = {
    /**
     * A hierarchical list of nodes that represent the Tree. End nodes have an
     * empty `nodes` array. *Required*
     */
    nodes: Node[];

    /**
     * Controls which node should have a visual indicator shown to the user.
     * The focused node can be only one even with multi-select trees.
     *
     * Used together with `onFocusChange` when the <Tree> is used as controlled component.
     */
    focused?: Node['id'];

    /**
     * Called every time the currently focused node changes. `onFocusChange`
     * is called with the id of the new node that should receive focus.
     */
    onFocusChange?: (id: Node['id']) => void;

    /**
     * Initially focused node. If `focused` and `defaultFocused` aren't provided
     * the <Tree> defaults to uncontrolled component with a `defaultFocused` value
     * of the first node's id.
     *
     * Note: `defaultFocused` can only be used when <Tree> is used as an
     * uncontrolled component and shouldn't be used toghether with `focused`.
     */
    defaultFocused?: Node['id'];

    /**
     * Controls which parent nodes should be expanded.
     *
     * Used together with `onExpandChange` when the <Tree> is used as controlled component.
     */
    expanded?: Node['id'][];

    /**
     * Called every time the currently expanded nodes changes. `onExpandChange`
     * is called with an array ids of the parent nodes that should be opened.
     */
    onExpandChange?: (ids: Node['id'][]) => void;

    /**
     * Initially expanded nodes. If `expanded` and `defaultExpanded` aren't provided
     * the <Tree> defaults to uncontrolled component with a `defaultExpanded`
     * value of an empty array (no expanded nodes).
     *
     * Note: `defaultExpanded` can only be used when <Tree> is used as an
     * uncontrolled component and shouldn't be used toghether with `expanded`.
     */
    defaultExpanded?: Node['id'][];

    /**
     * Controls which node is currently selected and should receive
     * `aria-selected="true"` attribute. A node selection changes when the user
     * clicks on a node or presses the `Enter` or `Space` key while focused on a node.
     * In a single-select tree only one node can be selected.
     *
     * Used together with `onSelectChange` when the <Tree> is used as controlled component.
     */
    selected?: Node['id'];

    /**
     * Called every time the currently selected node changes. `onSelectChange`
     * is called with the id of the new node that should have `aria-selected="true"`.
     */
    onSelectChange?: (id: Node['id']) => void;

    /**
     * Initially selected node. If `selected` and `defaultSelected` aren't provided
     * the <Tree> defaults to uncontrolled component with no selected nodes.
     *
     * Note: `defaultSelected` can only be used when <Tree> is used as an
     * uncontrolled component and shouldn't be used toghether with `selected`.
     */
    defaultSelected?: Node['id'];

    /**
     * A <Tree> component can accept a render prop function `renderLabel` to
     * customize what will be rendered for each node. It will be called with the
     * node's properties along with `isExpanded`, `isExpandable`, and a `toggleItem` function.
     *
     * When using `renderLabel` make sure to attach an `onClick` prop
     * to an element and call `toggleItem` from the click event handler.
     */
    renderLabel?: (args: RenderLabelArgs) => ReactElement<any>;
};

export type TreeProps = ComponentPropsWithoutRef<'ul'> & Props;

declare const Tree: NamedExoticComponent<TreeProps>;

export default Tree;
