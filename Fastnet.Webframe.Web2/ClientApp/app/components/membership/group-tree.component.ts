import { Component, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MembershipService } from './membership.service';
import { Group } from '../shared/common.types';
import { ITreeNode, TreeViewComponent } from '../../fastnet/controls/tree-view.component';
////import { TreeComponent } from 'angular-tree-component';
//import { findNode } from '@angular/compiler';
//import { ITreeNode, TreeViewComponent } from '../controls/tree-view.component';

class treeNode implements ITreeNode {
    htmlText: string;
    expanded: boolean;
    selected: boolean;
    nodes: treeNode[] = [];
    constructor(public group: Group, public parent: treeNode | null) {
        this.htmlText = group.name;
        this.expanded = false;
        this.selected = false;
        this.nodes = [];
    }
}
@Component({
    selector: 'group-tree',
    templateUrl: './group-tree.component.html',
    styleUrls: ['./group-tree.component.scss']
})
export class GroupTreeComponent implements AfterViewInit {
    @ViewChild(TreeViewComponent) private groupTree: TreeViewComponent;
    groupNodes: treeNode[] = [];
    @Output() selectedGroup = new EventEmitter<Group>();
    constructor(private membershipService: MembershipService) {

    }
    async ngAfterViewInit() {
        console.log(`afterviewinit()`);
        let groups = await this.membershipService.getGroups();
        for (let g of groups) {
            let tn = new treeNode(g, null);// { id: g.groupId, text: g.name, nodes: [] };
            this.groupNodes.push(tn);
            await this.loadSubGroups(g, tn);
        }
    }
    onTreeNodeSelected(node: treeNode) {
        console.log(`selected group ${node.group.name}`);
        this.selectedGroup.emit(node.group);
    }

    addGroup(group: Group) {
        //console.log(`adding group ${group.name}`);
        let parentNode = this.findNodeByGroupId(<number>group.parentGroupId);// this.findNode(group);
        if (parentNode !== null) {
            if (parentNode !== null) {
                let tn = new treeNode(group, parentNode);
                parentNode.nodes.push(tn);
                parentNode.nodes = parentNode.nodes.sort((l, r) => {
                    return l.group.name.localeCompare(r.group.name);
                });
                this.groupTree.selectNode(tn);
            }
        }
    }
    removeGroup(group: Group) {
        console.log(`removing group ${group.name}`);
        let n = this.findNode(group);
        if (n !== null) {
            let parentNode = n.parent;// this.findNode(parent);
            if (parentNode !== null) {
                console.log(`found parent node ${parentNode.group.name}`);
                let index = parentNode.nodes.findIndex((x) => x.group.groupId === group.groupId);
                if (index >= 0) {
                    parentNode.nodes.splice(index, 1);
                }
            }
        }
    }
    private async loadSubGroups(group: Group, node: treeNode) {
        let subgroups = await this.membershipService.getGroups(group.groupId);
        for (let g of subgroups) {
            let tn = new treeNode(g, node);// { id: g.groupId, text: g.name, nodes: [] };
            node.nodes.push(tn);
            await this.loadSubGroups(g, tn);
        }
    }
    private findNode(group: Group) : treeNode | null {
        console.log(`looking for group ${group.name}, id ${group.groupId}`);
        return this.findNodeByGroupId(group.groupId);
    }
    private findNodeByGroupId(groupId: number): treeNode | null {
        console.log(`looking for group id ${groupId}`);
        for (let n of this.groupNodes) {
            let r = this.findNodeX(groupId, n);
            if (r !== null) {
                return r;
            }
        }
        return null;
    }
    private findNodeX(groupId: number, node: treeNode): treeNode | null {
        if (node.group.groupId === groupId) {
            return node;
        } 
        for (let n of node.nodes) {
            let r = this.findNodeX(groupId, n);
            if (r !== null) {
                return r;
            }
        }
        return null;
    }
}
