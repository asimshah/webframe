import { Component, ElementRef,  AfterViewInit, ViewChild, Directive, Output, EventEmitter } from '@angular/core';
import { ModalDialogComponent } from '../../modaldialog/modal-dialog.component';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { EditorService, Directory } from './editor.service';
import { ITreeNode, TreeViewComponent } from '../../controls/tree-view.component';
import { ControlState, ValidationResult, PropertyValidatorAsync } from '../../controls/controls.component';
import { Dictionary } from '../../types/dictionary.types';
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
    public validators: Dictionary<PropertyValidatorAsync>;
    directoryNodes: treeNode[] = [];
    treeOptions: {};
    selectedDirectory: Directory | null = null;
    subdirectory: Directory | null = null;
    nameValidator = new PropertyValidatorAsync((cs) => this.directoryNameValidatorAsync(cs));
   // @Output() selectedDirectory = new EventEmitter<Directory>();
    constructor(private editorService: EditorService, modalDialogService: ModalDialogService, el: ElementRef) {
        super(modalDialogService, el);
    }
    //async ngAfterViewInit() {
    //    console.log(`ngAfterViewInit()`);

    //}
    open() {
        this.subdirectory = new Directory();
        this.subdirectory.name = "";
        //this.validators = new Dictionary<PropertyValidatorAsync>();
        //this.validators.add("sdname", new PropertyValidatorAsync((cs) => this.directoryNameValidatorAsync(cs)));
        this.modalDialogService.open(this.id);
    }
    onClose() {
        //this.validators.
        this.modalDialogService.close(this.id);
    }
    async onTreeNodeSelected(node: treeNode) {
        console.log(`selected direcory ${node.directory.name}`);
        this.selectedDirectory = node.directory;
        await this.editorService.getDirectoryContent(node.directory.id);
    }
    async afterOpen() {
        console.log(`afterOpen`);
        this.directoryNodes = [];
        this.selectedDirectory = null;
        let directories = await this.editorService.getDirectories();
        for (let d of directories) {
            //this.directories.push(d);
            let tn = new treeNode(d, null);// { id: d.id, name: d.name, children: [] };
            this.directoryNodes.push(tn);
            await this.loadSubDirectories(d, tn);
        }
        //this.directoryTree.treeModel.update();
    }
    async onAddDirectory() {
        this.modalDialogService.open("new-directory");
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
            //console.log(`${JSON.stringify(cs)}`);
            resolve(cs.validationResult);
        });
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
