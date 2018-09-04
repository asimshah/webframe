import { Component, ElementRef, AfterViewInit, ViewChild, Directive, Output, EventEmitter } from '@angular/core';
import { ModalDialogComponent } from '../../modaldialog/modal-dialog.component';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { EditorService, Directory, Content, UploadData, Image, Page, Document, NewPage } from './editor.service';
import { ITreeNode, TreeViewComponent } from '../../controls/tree-view.component';
import { ControlState, ValidationResult, PropertyValidatorAsync } from '../../controls/controls.types';
import { ControlBase } from '../../controls/controls.component';
import { Dictionary } from '../../types/dictionary.types';
import { MessageBoxResult } from '../../modaldialog/message-box.component';
import { Base64ChunkReader } from '../../types/ChunkReader';
import { ServiceResult } from '../../shared/base.service';
import { PagePropertiesComponent } from './page-properties.component';
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
class fileUploadItem {
    file: File;
    progress: number;
}
enum ContentCommands {
    DeleteDirectory,
    ShowDirectoryProperties,
    AddSubdirectory,
    UploadFiles,
    AddNewPage
}

@Component({
    selector: 'content-browser',
    templateUrl: './content-browser.component.html',
    styleUrls: ['./content-browser.component.scss']
})
export class ContentBrowserComponent extends ModalDialogComponent /*implements AfterViewInit */ {
    ContentCommands = ContentCommands;
    @ViewChild(TreeViewComponent) private directoryTree: TreeViewComponent;
    message: string;
    directoryNodes: treeNode[] = [];
    treeOptions: {};
    selectedDirectory: Directory | null = null;
    content?: Content | null = null;
    subdirectory: Directory | null = null;
    uploadInProgress = false;
    filesToUpload: fileUploadItem[] = [];
    @ViewChild("fileInput") uploadInputElement: ElementRef;
    @ViewChild("pageProperties") pageProperties: PagePropertiesComponent;
    directoryNameValidator = new PropertyValidatorAsync((cs) => this.directoryNameValidatorAsync(cs));
    newPageNameValidator = new PropertyValidatorAsync((cs) => this.pageNameValidatorAsync(cs));
    newPage: NewPage | null = null;
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
        this.reloadContent();
        //this.content = await this.editorService.getDirectoryContent(node.directory.id);
        //console.log(`content received isEmpty = ${this.content.isEmpty()}`);
    }
    async afterOpen() {
        console.log(`afterOpen`);
        await this.reload();
    }
    async onAddDirectory() {
        this.modalDialogService.open("new-directory");
    }
    async onCreateNewDirectory() {
        if (await this.modalDialogService.isValid("new-directory")) {
            this.subdirectory!.parentId = this.selectedDirectory!.id;
            let sr = await this.editorService.createDirectory(this.subdirectory!);
            if (!sr.success) {
                this.message = sr.errors[0];
                this.modalDialogService.showMessageBox("warningBox");
            } else {
                await this.reload();
                this.modalDialogService.close("new-directory");
            }
        } else {
            console.log("onCreateNewDirectory(): form not valid");
        }
    }
    async onDeleteDirectory() {
        if (this.selectedDirectory !== null) {
            this.message = "Deleting a directory will also delete all the contents of that directory. Deletions are not reversible. Select OK to proceed";
            let r = await this.modalDialogService.showMessageBox("confirmBox");
            if (r === MessageBoxResult.ok) {
                let sr = await this.editorService.deleteDirectory(this.selectedDirectory!.id);
                await this.reload();
            }
        }
    }
    async onCancelNewDirectory() {
        this.subdirectory = new Directory();
        this.subdirectory.name = "";
        this.modalDialogService.close("new-directory");
    }
    async onDeleteDocument(doc: Document) {
        if (this.selectedDirectory !== null) {
            console.log(`loading from message box`);
            this.message = "Deleting a document is a permanent step. Select OK to proceed";
            let r = await this.modalDialogService.showMessageBox("confirmBox");
            if (r === MessageBoxResult.ok) {
                await this.editorService.deleteDocument(doc, this.selectedDirectory);
                console.log(`back from message box`);
                await this.reloadContent();
            }
        }
    }
    async onDeleteImage(image: Image) {
        if (this.selectedDirectory !== null) {
            this.message = "Deleting an image is a permanent step. Select OK to proceed";
            let r = await this.modalDialogService.showMessageBox("confirmBox");
            if (r === MessageBoxResult.ok) {
                await this.editorService.deleteImage(image, this.selectedDirectory);
                await this.reloadContent();
            }        
        }
    }
    async onDeletePage(page: Page) {
        if (this.selectedDirectory !== null) {
            this.message = "Deleting a page is a permanent step. Select OK to proceed";
            let r = await this.modalDialogService.showMessageBox("confirmBox");
            if (r === MessageBoxResult.ok) {
                let sr = await this.editorService.deletePage(page, this.selectedDirectory);
                await this.reloadContent();
            }  
        }
    }
    getNewDirectoryCaption(): string {
        if (this.selectedDirectory !== null) {
            return `New Subdirectory (of ${this.selectedDirectory.name})`;
        }
        return "";
    }
    onAddNewPage() {
        if (this.selectedDirectory !== null) {
            this.newPage = new NewPage();
            this.newPage.directoryId = this.selectedDirectory.id;
            this.newPage.name = "";
            this.modalDialogService.open("new-page");
        }
    }
    async onCreateNewPage() {
        if (this.newPage != null) {
            if (await this.modalDialogService.isValid("new-page")) {
                let sr = await this.editorService.createPage(this.newPage);
                if (!sr.success) {
                    this.message = sr.errors[0];
                    await this.modalDialogService.showMessageBox("warningBox");
                } else {
                    this.reloadContent();
                    this.newPage = null;
                    this.modalDialogService.close("new-page");
                }
            } else {
                console.log("onCreateNewPage(): form not valid");
            }
        }
    }
    onCancelNewPage() {
        this.newPage = null;
        this.modalDialogService.close("new-page");
    }
    getNewPageCaption(): string {
        if (this.selectedDirectory !== null) {
            return `New Page (in ${this.selectedDirectory.name})`;
        }
        return "";
    }
    canExecute(cmd: ContentCommands): boolean {
        let r = false;
        if (!this.uploadInProgress) {
            switch (cmd) {
                default:
                    break;
                case ContentCommands.DeleteDirectory:
                case ContentCommands.ShowDirectoryProperties:
                    r = this.selectedDirectory != null && this.selectedDirectory.parentId > 0;
                    break;
                case ContentCommands.AddSubdirectory:
                case ContentCommands.UploadFiles:
                case ContentCommands.AddNewPage:
                    r = this.selectedDirectory != null;
                    break;
            }
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
    pageNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        console.log(`newPageNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = (<string>cs.value || "").trim();
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a page name is required`;
            }
            resolve(cs.validationResult);
        });
    }
    onUploadFiles() {
        this.filesToUpload = [];
        this.uploadInputElement.nativeElement.value = "";
        this.modalDialogService.open("upload-files");
    }
    onFileSelected(e: any) {
        let element = <HTMLInputElement>e.target;
        //let file = <string>e.target.files[0];
        if (element.files && this.filesToUpload.length > 0) {
            let file = element.files[0];
            console.log(`${file.name} selected for upload, ${file.size}`);
            let item = new fileUploadItem();
            item.file = file;
            item.progress = 0;
            this.filesToUpload.push(item);
        }
    }
    async onStartFileUpload() {
        return new Promise<void>(async resolve => {
            if (this.filesToUpload.length > 0) {
                this.uploadInProgress = true;
                for (let item of this.filesToUpload) {
                    let r = await this.editorService.checkContentExists(this.selectedDirectory!.id, item.file.name);
                    if (!r) {
                        await this.uploadFile(item);
                    } else {
                        this.message = `${item.file.name} will not be uploaded as it already exists in folder ${this.selectedDirectory!.name}.`;
                        await this.modalDialogService.showMessageBox("warningBox");
                    }
                    //console.log(`file ${item.file.name} finished`);
                }
                //console.log("onStartFileUpload 2");
                //this.content = await this.editorService.getDirectoryContent(this.selectedDirectory!.id);
                this.reloadContent();
                setTimeout(() => {
                    this.filesToUpload = [];
                    this.uploadInProgress = false;
                    this.modalDialogService.close("upload-files");
                    resolve();
                }, 2000);
            }
        });
    }
    onCancelFileUpload() {
        this.filesToUpload = [];
        this.uploadInProgress = false;
        this.modalDialogService.close("upload-files");
    }
    onPageProperties(page: Page) {
        this.pageProperties.page = page;
        this.pageProperties.open();
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
    private async reloadContent() {
        if (this.selectedDirectory !== null) {
            this.content = await this.editorService.getDirectoryContent(this.selectedDirectory.id);
            console.log(`content reloaded for directory ${this.selectedDirectory.name}`);
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
    async uploadFile(fui: fileUploadItem) {
        console.log(`Starting file ${fui.file.name}, type ${fui.file.type}`);
        let upd = new UploadData();
        upd.filename = fui.file.name;
        upd.filelength = fui.file.size;
        upd.directoryId = this.selectedDirectory!.id;
        upd.mimeType = fui.file.type;
        let bytesSent = 0;
        let cr = new Base64ChunkReader(fui.file);
        //return new Promise<ServiceResult>(async resolve1 => {
        return cr.ReadAll(async (cn: number, offset: number, data: string, isLast: boolean) => {
            return new Promise<void>(async resolve => {
                upd.chunkNumber = cn;
                upd.base64Data = data;
                upd.isLastChunk = isLast;
                bytesSent += cr.chunkSize;
                if (bytesSent > fui.file.size) {
                    bytesSent = fui.file.size;
                }
                fui.progress = (bytesSent / fui.file.size) * 100.0;
                let dr = await this.editorService.sendChunk(upd);
                if (typeof dr === "string") {
                    upd.key = dr;
                }
                else {
                    console.log(`${JSON.stringify(dr)}`);
                }
                resolve();
            });
            //return this.handleChunk(cn, offset, data, isLast);
        });
        //});

    }
}
const chunkLength = 8192;
