﻿import { Component, Input, ViewEncapsulation, OnInit, Inject, forwardRef, AfterViewInit, ViewChildren, QueryList, EventEmitter, Output } from '@angular/core';

export interface ITreeNode {
    text: string;
    nodes: ITreeNode[];
    expanded: boolean;
    selected: boolean;
}


@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TreeViewComponent  {
    @Input() parent: TreeViewComponent;
    @Input() nodes: ITreeNode[] = []
    @Input() level: number = 0;
    @Output() selected = new EventEmitter<ITreeNode>();
    //@ViewChildren(TreeViewComponent) childComponents: QueryList<TreeViewComponent>
    instance: TreeViewComponent;

    constructor() {
        this.instance = this;
    }
    onNodeClick(node: ITreeNode) {
        if (node.selected === false) {
            let root = this.findRoot();
            //console.log(`root node is at level ${root.level}`);
            this.setNodeSelected(node);
            root.selected.emit(node);
        }
    }
    selectNode(node: ITreeNode) {
        this.setNodeSelected(node);
    }
    onNodeIconClick(node: ITreeNode) {
        node.expanded = !node.expanded;
    }
    showChildren(node: ITreeNode): boolean {
        //return this.level == 0 || node.expanded === true;
        return node.expanded === true;
    }
    hasNodes(): boolean {
        return this.nodes && this.nodes.length > 0;
    }
    hasChildren(node: ITreeNode): boolean {
        return node.nodes && node.nodes.length > 0;
    }
    getIconClass(node: ITreeNode): string {
        return node.expanded ? "fa-minus-square-o" : "fa-plus-square-o";
    }
    private setNodeSelected(n: ITreeNode) {
        let root = this.findRoot();
        this.deselectNodes(root.nodes);
        n.selected = true;
    }
    private deselectNodes(nodes: ITreeNode[]) {
        for (let n of nodes) {
            //console.log(`deselecting node ${n.text}`);
            n.selected = false;
            this.deselectNodes(n.nodes);
        }
        //this.childComponents.forEach((child) => {

        //});
    }
    private findRoot(): TreeViewComponent {
        let p = this.instance;
        while (p.parent) {
            p = p.parent;
        }
        return p;
    }

}