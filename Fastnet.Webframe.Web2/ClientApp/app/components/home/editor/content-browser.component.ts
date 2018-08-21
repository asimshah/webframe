import { Component, ElementRef,  AfterViewInit, ViewChild, Directive, Output, EventEmitter } from '@angular/core';
import { ModalDialogComponent } from '../../modaldialog/modal-dialog.component';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { EditorService, Directory, Content } from './editor.service';
import { ITreeNode, TreeViewComponent } from '../../controls/tree-view.component';
import { ControlState, ValidationResult, PropertyValidatorAsync, ControlBase } from '../../controls/controls.component';
import { Dictionary } from '../../types/dictionary.types';
import { MessageBoxResult } from '../../modaldialog/message-box.component';
//import { TreeComponent } from 'angular-tree-component';

class treeNode implements ITreeNode {
    text: string;
    expanded: boolean;
    selected: boolean;
    nodes: treeNode[] = [];
    constructor(public directory: Directory, public parent: treeNode | null) {
        this.text = directory.name;
        this.expanded = false;
        this.selected = false;
        this.nodes = [];
    }
}

enum ContentCommands {
    DeleteDirectory,
    ShowDirectoryProperties,
    AddSubdirectory
}

@Component({
    selector: 'content-browser',
    templateUrl: './content-browser.component.html',
    styleUrls: ['./content-browser.component.scss']
})
export class ContentBrowserComponent extends ModalDialogComponent /*implements AfterViewInit */{
    ContentCommands = ContentCommands;
    @ViewChild(TreeViewComponent) private directoryTree: TreeViewComponent;
    message: string;
    directoryNodes: treeNode[] = [];
    treeOptions: {};
    selectedDirectory: Directory | null = null;
    content?: Content | null = null;
    subdirectory: Directory | null = null;
    nameValidator = new PropertyValidatorAsync((cs) => this.directoryNameValidatorAsync(cs));
    constructor(private editorService: EditorService, modalDialogService: ModalDialogService, el: ElementRef) {
        super(modalDialogService, el);
    }
    open() {
        this.modalDialogService.open(this.id);
    }
    onClose() {
        this.modalDialogService.close(this.id);
    }
    async onTreeNodeSelected(node: treeNode) {
        console.log(`selected direcory ${node.directory.name}`);
        this.selectedDirectory = node.directory;
        this.content = await this.editorService.getDirectoryContent(node.directory.id);
        console.log(`content received isEmpty = ${this.content.isEmpty()}`);
    }
    async afterOpen() {
        console.log(`afterOpen`);
        await this.reload();
    }
    async onAddDirectory() {
        this.modalDialogService.open("new-directory");
    }
    async onCreateNewDirectory() {
        this.subdirectory!.parentId = this.selectedDirectory!.id;
        let sr = await this.editorService.createDirectory(this.subdirectory!);
        if (!sr.success) {
            this.message = sr.errors[0];
            this.modalDialogService.showMessageBox("warningBox");
        } else {
            await this.reload();
            this.modalDialogService.close("new-directory");
        }
    }
    async onDeleteDirectory() {
        if (this.selectedDirectory !== null) {
            this.message = "Deleting a directory will also delete all the contents of that directory. Deletions are not reversible. Select OK to proceed";
            this.modalDialogService.showMessageBox("confirmBox", async (r) => {
                if (r === MessageBoxResult.ok) {
                    let sr = await this.editorService.deleteDirectory(this.selectedDirectory!.id);
                    await this.reload();
                }
            });            
        }
    }
    async onCancelNewDirectory() {
        this.modalDialogService.close("new-directory");
    }
    getNewDirectoryCaption(): string {
        if (this.selectedDirectory !== null) {
            return `New Subdirectory (of ${this.selectedDirectory.name})`;
        }
        return "";
    }
    canExecute(cmd: ContentCommands): boolean {
        let r = false;
        switch (cmd) {
            default:
                break;
            case ContentCommands.DeleteDirectory:
            case ContentCommands.ShowDirectoryProperties:
                r = this.selectedDirectory != null && this.selectedDirectory.parentId > 0;
                break;
            case ContentCommands.AddSubdirectory:
                r = this.selectedDirectory != null;
                break;
        }
        return r;
    }
    directoryNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        console.log(`directoryNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = (<string>cs.value || "").trim();
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a directory name is required`;
            } else if (text.length < 4) {
                vr.valid = false;
                vr.message = `a directory name must be at 4 characters long`;
            }
            resolve(cs.validationResult);
        });
    }
    private async reload() {
        this.subdirectory = new Directory();
        this.subdirectory.name = "";
        this.directoryNodes = [];
        this.selectedDirectory = null;
        this.content = null;
        let directories = await this.editorService.getDirectories();
        for (let d of directories) {
            let tn = new treeNode(d, null);// { id: d.id, name: d.name, children: [] };
            this.directoryNodes.push(tn);
            await this.loadSubDirectories(d, tn);
        }
    }
    private async loadSubDirectories(dir: Directory, node: treeNode) {
        let subDirectories = await this.editorService.getDirectories(dir.id);
        for (let d of subDirectories) {
            let tn = new treeNode(d, node);
            node.nodes.push(tn);
            await this.loadSubDirectories(d, tn);

        }
    }

}
