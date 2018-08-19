import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output, group } from '@angular/core';
import { MembershipService } from './membership.service';
import { Group } from '../shared/common.types';
//import { TreeComponent } from 'angular-tree-component';
import { findNode } from '@angular/compiler';
import { ITreeNode, TreeViewComponent } from '../controls/tree-view.component';

class treeNode implements ITreeNode {
    //id: number;
    text: string;
    expanded: boolean;
    selected: boolean;
    nodes: treeNode[] = [];
    constructor(public group: Group, public parent: treeNode | null) {
        //this.id = group.groupId
        this.text = group.name;
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
    //groups: Group[] = [];
    groupNodes: treeNode[] = [];
    //treeOptions: {};
    @Output() selectedGroup = new EventEmitter<Group>();
    constructor(private membershipService: MembershipService) {

    }
    async ngAfterViewInit() {
        console.log(`afterviewinit()`);
        let groups = await this.membershipService.getGroups();
        //this.groups = groups.;
        for (let g of groups) {
            //this.groups.push(g);
            //console.log(`ngAfterViewInit(): group ${g.name}, group count is ${groups.length}`);
            let tn = new treeNode(g, null);// { id: g.groupId, text: g.name, nodes: [] };
            this.groupNodes.push(tn);
            await this.loadSubGroups(g, tn);
        }
        //this.groupTree.treeModel.update();
    }
    onTreeNodeSelected(node: treeNode) {
        console.log(`selected group ${node.group.name}`);
        this.selectedGroup.emit(node.group);
    }
    //onActivate(e: any) {
    //    let groupId: number = e.node.data.id;
    //    this.selectedGroup.emit(this.findGroup(groupId));
    //    //console.log(`activated group ${this.selectedGroup.name}`);
    //}
    addGroup(group: Group) {
        console.log(`adding group ${group.name}`);
        //debugger;
        //let parent = this.findGroup(<number>group.parentGroupId);
        let parentNode = this.findNodeByGroupId(<number>group.parentGroupId);// this.findNode(group);
        if (parentNode !== null) {
            //let parentNode = n.parent;// this.findNode(parent);
            if (parentNode !== null) {
                let tn = new treeNode(group, parentNode);
                parentNode.nodes.push(tn);
                parentNode.nodes = parentNode.nodes.sort((l, r) => {
                    return l.text.localeCompare(r.text);
                });
                this.groupTree.selectNode(tn);
                //this.groups.push(group);
                //console.log(`added group ${group.name} as child of group id ${node.text}`);
                //this.groupTree.treeModel.update();
            }
        }
    }
    removeGroup(group: Group) {
        console.log(`removing group ${group.name}`);
        //debugger;
        //let parent = this.findGroup(<number>group.parentGroupId);
        let n = this.findNode(group);
        if (n !== null) {
            let parentNode = n.parent;// this.findNode(parent);
            if (parentNode !== null) {
                console.log(`found parent node ${parentNode.text}`);
                let index = parentNode.nodes.findIndex((x) => x.group.groupId === group.groupId);
                if (index >= 0) {
                    parentNode.nodes.splice(index, 1);
                    //let i = this.groups.findIndex(x => x.groupId === group.groupId);
                    //if (i >= 0) {
                    //    this.groups.splice(i, 1);
                    //}
                    //this.groupTree.treeModel.update();
                }
            }
        }
    }
    private async loadSubGroups(group: Group, node: treeNode) {
        let subgroups = await this.membershipService.getGroups(group.groupId);
        //debugger;
        for (let g of subgroups) {
            //this.groups.push(g);
            let tn = new treeNode(g, node);// { id: g.groupId, text: g.name, nodes: [] };
            node.nodes.push(tn);
            await this.loadSubGroups(g, tn);
            //console.log(`group ${g.name}`);
            //this.groups.push(g);
        }
    }
    private findNode(group: Group) : treeNode | null {
        console.log(`looking for group ${group.name}, id ${group.groupId}`);
        return this.findNodeByGroupId(group.groupId);
        //for (let n of this.groupNodes) {
        //    let r = this.findNodeX(group.groupId, n);
        //    if (r !== null) {
        //        return r;
        //    }
        //}
        //return null;
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
