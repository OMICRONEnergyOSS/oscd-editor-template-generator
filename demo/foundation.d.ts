import { TreeSelection } from '@openenergytools/tree-grid';
export interface NodeData {
    name?: string;
    tagName?: string;
    typeKind?: string;
    children?: Record<string, NodeData>;
    [key: string]: unknown;
}
/**
 * Get the selection object by navigating through a specific path in the tree selection structure
 */
export declare function getSelectionByPath(selection: TreeSelection, path: string[]): TreeSelection;
/**
 * Returns selection of mandatory enums and fills them with values recursively.
 */
export declare function processEnums(selection: TreeSelection, node: NodeData): TreeSelection;
export declare function serializeAndFormat(doc: XMLDocument): string;
export declare function createBaseSCLDoc(): XMLDocument;
