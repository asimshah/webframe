
import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MembershipService } from './membership.service';
import { Group } from '../shared/common.types';
import { TreeComponent } from 'angular-tree-component';
import { findNode } from '@angular/compiler';
class treeNode {
    id: number;
    name: string;
    children: treeNode[] = [];

}
@Component({
    selector: 'group-tree',
    templateUrl: './group-tree.component.html',
    styleUrls: ['./group-tree.component.scss']
})
export class GroupTreeComponent implements OnInit, AfterViewInit {
    @ViewChild(TreeComponent) private groupTree: TreeComponent;
    groups: Group[] = [];
    groupNodes: treeNode[] = [];
    treeOptions: {};
    @Output() selectedGroup = new EventEmitter<Group>();
    constructor(private membershipService: MembershipService) {

    }
    async ngOnInit() {

    }
    async ngAfterViewInit() {
        console.log(`afterviewinit()`);
        let groups = await this.membershipService.getGroups();
        //this.groups = groups.;
        for (let g of groups) {
            this.groups.push(g);
            console.log(`ngAfterViewInit(): group ${g.name}, group count is ${groups.length}`);
            let tn = { id: g.groupId, name: g.name, children: [] };
            this.groupNodes.push(tn);
            await this.loadSubGroups(g, tn);
        }
        this.groupTree.treeModel.update();
    }
    onActivate(e: any) {
        let groupId: number = e.node.data.id;
        this.selectedGroup.emit(this.findGroup(groupId));
        //console.log(`activated group ${this.selectedGroup.name}`);
    }
    addGroup(group: Group) {
        console.log(`adding group ${group.name}`);
        //debugger;
        let parent = this.findGroup(<number>group.parentGroupId);
        let node = this.findNode(parent);
        if (node !== null) {
            node.children.push({ id: group.groupId, name: group.name, children: [] })
            this.groups.push(group);
            console.log(`added group ${group.name} as child of group id ${node.id}`);
            this.groupTree.treeModel.update();
        }
    }
    removeGroup(group: Group) {
        console.log(`removing group ${group.name}`);
        //debugger;
        let parent = this.findGroup(<number>group.parentGroupId);
        let node = this.findNode(parent);
        if (node !== null) {
            console.log(`found parent node ${node.name}`);
            let index = node.children.findIndex((x) => x.id === group.groupId);
            if (index >= 0) {
                node.children.splice(index, 1);
                let i = this.groups.findIndex(x => x.groupId === group.groupId);
                if (i >= 0) {
                    this.groups.splice(i, 1);
                }
                this.groupTree.treeModel.update();
            }
        }
    }
    private async loadSubGroups(group: Group, node: treeNode) {
        let subgroups = await this.membershipService.getGroups(group.groupId);
        //debugger;
        for (let g of subgroups) {
            //this.groups.push(g);
            let tn = { id: g.groupId, name: g.name, children: [] };
            node.children.push(tn);
            await this.loadSubGroups(g, tn);
            console.log(`group ${g.name}`);
            this.groups.push(g);
        }
    }
    private findNode(group: Group) {
        console.log(`looking for group ${group.name}, id ${group.groupId}`);
        for (let n of this.groupNodes) {
            let r = this.findNodeX(group, n);
            if (r !== null) {
                return r;
            }
        }
        return null;
    }
    private findNodeX(group: Group, node: treeNode): treeNode | null {
        if (node.id === group.groupId) {
            return node;
        } 
        for (let n of node.children) {
            let r = this.findNodeX(group, n);
            if (r !== null) {
                return r;
            }
        }
        return null;
    }
    private findGroup(id: number): Group {
        return <Group>this.groups.find(x => x.groupId === id);
    }

    //private async addToTree(node: treeNode, groups: Group[]) {
    //    for (let g of groups) {
    //        let tn: treeNode = { id: g.groupId, name: g.name, children: [] };
    //        node.children.push(tn);
    //    }
    //}
}
