import { Component, ElementRef,  AfterViewInit, ViewChild, Directive, Output, EventEmitter } from '@angular/core';
import { ModalDialogComponent } from '../../modaldialog/modal-dialog.component';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { EditorService, Directory } from './editor.service';
//import { TreeComponent } from 'angular-tree-component';

class treeNode {
    id: number;
    name: string;
    children: treeNode[] = [];

}

@Component({
    selector: 'content-browser',
    templateUrl: './content-browser.component.html',
    styleUrls: ['./content-browser.component.scss']

})
export class ContentBrowserComponent extends ModalDialogComponent implements AfterViewInit {
    //@ViewChild(TreeComponent) private directoryTree: TreeComponent;
    directories: Directory[] = [];
    directoryNodes: treeNode[] = [];
    treeOptions: {};
   // @Output() selectedDirectory = new EventEmitter<Directory>();
    constructor(private editorService: EditorService, modalDialogService: ModalDialogService, el: ElementRef) {
        super(modalDialogService, el);
    }

    async ngAfterViewInit() {
        console.log(`ngAfterViewInit()`);

    }
    open() {
        this.modalDialogService.open(this.id);
    }
    onClose() {
        this.modalDialogService.close(this.id);
    }
    async onActivate(e: any) {
        let id: number = e.node.data.id;
        //this.selectedDirectory.emit(this.findDirectory(id));
        let dir = this.findDirectory(id);
        console.log(`selected directory ${dir.id}, name ${dir.name}`);
        await this.editorService.getDirectoryContent(dir.id);
    }
    async afterOpen() {
        console.log(`afterOpen`);
        this.directoryNodes = [];
        let directories = await this.editorService.getDirectories();
        for (let d of directories) {
            this.directories.push(d);
            let tn = { id: d.id, name: d.name, children: [] };
            this.directoryNodes.push(tn);
            await this.loadSubDirectories(d, tn);
        }
        //this.directoryTree.treeModel.update();
    }
    private async loadSubDirectories(dir: Directory, node: treeNode) {
        let subDirectories = await this.editorService.getDirectories(dir.id);// this.membershipService.getGroups(group.groupId);
        //debugger;
        for (let d of subDirectories) {
            //this.groups.push(g);
            let tn = { id: d.id, name: d.name, children: [] };
            node.children.push(tn);
            await this.loadSubDirectories(d, tn);
            this.directories.push(d);
        }
    }
    private findDirectory(id: number): Directory {
        return <Directory>this.directories.find(x => x.id === id);
    }
}
