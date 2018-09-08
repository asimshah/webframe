import { Component, ElementRef, ViewChild } from '@angular/core';
import { EditorService, Directory, Content, UploadData, Image, Page, Document, NewPage, PageType } from './editor.service';

import { PagePropertiesComponent } from './page-properties.component';

import { UploadDialogComponent, FileUploadItem } from '../../../fastnet/uploader/upload-files.component';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
import { TreeViewComponent, ITreeNode } from '../../../fastnet/controls/tree-view.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageResult } from '../../../fastnet/controls/popup-message.component';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import { isNullorUndefinedorWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase2.type';
import { noop } from '../../../fastnet/core/date.functions';
import { Base64ChunkReader } from '../../../fastnet/core/base64.chunkreader';


class treeNode implements ITreeNode {
    htmlText: string;
    expanded: boolean;
    selected: boolean;
    nodes: treeNode[] = [];
    constructor(public directory: Directory, public parent: treeNode | null) {
        this.htmlText = directory.name;
        this.expanded = false;
        this.selected = false;
        this.nodes = [];
    }
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
export class ContentBrowserComponent {
    ContentCommands = ContentCommands;
    message: string;
    directoryNodes: treeNode[] = [];
    treeOptions: {};
    selectedDirectory: Directory | null = null;
    content?: Content | null = null;
    subdirectory: Directory;

    @ViewChild('contentbrowser') private contentBrowserPopup: PopupDialogComponent;
    @ViewChild(TreeViewComponent) private directoryTree: TreeViewComponent;
    @ViewChild("fileInput") uploadInputElement: ElementRef;
    @ViewChild("pageProperties") pageProperties: PagePropertiesComponent;
    @ViewChild('newDirectoryDialog') newDirectoryPopup: PopupDialogComponent;
    @ViewChild('newPageDialog') newPagePopup: PopupDialogComponent;
    @ViewChild('viewImageDialog') imageViewerPopup: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @ViewChild('uploadFilesDialog') uploadFiles: UploadDialogComponent;

    newPage: NewPage;// | null = null;
    imageOnView: Image;
    uploadInProgress = false;
    constructor(private editorService: EditorService, el: ElementRef) {

    }
    open() {
        this.contentBrowserPopup.open(() => {

        }, async () => {
            await this.reload();
        });
        //this.modalDialogService.open(this.id);
    }
    onClose() {
        this.contentBrowserPopup.close();
    }
    async onTreeNodeSelected(node: treeNode) {
        console.log(`selected directory ${node.directory.fullname}`);
        this.selectedDirectory = node.directory;
        this.reloadContent();
        //this.content = await this.editorService.getDirectoryContent(node.directory.id);
        //console.log(`content received isEmpty = ${this.content.isEmpty()}`);
    }

    async onAddDirectory() {
        this.newDirectoryPopup.open(async (r) => {
            if (r) {
                this.subdirectory!.parentId = this.selectedDirectory!.id;
                let sr = await this.editorService.createDirectory(this.subdirectory!);
                if (!sr.success) {
                    //this.message = sr.errors[0];
                    let options = new PopupMessageOptions();
                    options.warning = true;
                    this.popupMessage.open(sr.errors, noop, options);
                    //this.modalDialogService.showMessageBox("warningBox");
                    return false;
                } else {
                    await this.reload();
                    //this.modalDialogService.close("new-directory");
                }
            } else {
                this.subdirectory = new Directory();
                //this.subdirectory.name = "";
            }
            return true;
        });
        //this.modalDialogService.open("new-directory");
    }
    async onCancelNewDirectory() {
        this.newDirectoryPopup.close(false);
    }
    async onCreateNewDirectory() {
        if (await this.newDirectoryPopup.isValid()) {
            this.newDirectoryPopup.close(true);
        }
    }
    async onDeleteDirectory() {
        if (this.selectedDirectory !== null) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("Deleting a directory will also delete all the contents of that directory. Deletions are not reversible. Select OK to proceed",
                async (r) => {
                    if (r === PopupMessageResult.ok) {
                        let sr = await this.editorService.deleteDirectory(this.selectedDirectory!.id);
                        await this.reload();
                    }
                }, options);
        }
        //if (this.selectedDirectory !== null) {
        //    this.message = "Deleting a directory will also delete all the contents of that directory. Deletions are not reversible. Select OK to proceed";
        //    let r = await this.modalDialogService.showMessageBox("confirmBox");
        //    if (r === MessageBoxResult.ok) {
        //        let sr = await this.editorService.deleteDirectory(this.selectedDirectory!.id);
        //        await this.reload();
        //    }
        //}
    }

    async onDeleteDocument(doc: Document) {
        if (this.selectedDirectory !== null) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("Deleting a document is a permanent step. Select OK to proceed",
                async (r) => {
                    if (r === PopupMessageResult.ok) {
                        await this.editorService.deleteDocument(doc, this.selectedDirectory!);
                        await this.reloadContent();
                    }
                }, options);
        }
    }
    async onDeleteImage(image: Image) {
        if (this.selectedDirectory !== null) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("Deleting an image is a permanent step.Select OK to proceed",
                async (r) => {
                    if (r === PopupMessageResult.ok) {
                        await this.editorService.deleteImage(image, this.selectedDirectory!);
                        await this.reloadContent();
                    }
                }, options);
            //this.message = "Deleting an image is a permanent step. Select OK to proceed";
            //let r = await this.modalDialogService.showMessageBox("confirmBox");
            //if (r === MessageBoxResult.ok) {
            //    await this.editorService.deleteImage(image, this.selectedDirectory);
            //    await this.reloadContent();
            //}        
        }
    }
    onViewImage(image: Image) {
        if (this.selectedDirectory !== null) {
            this.imageOnView = image;
            this.imageViewerPopup.open(() => {

            });
        }
    }
    onCloseImageViewer() {
        this.imageViewerPopup.close();
    }
    async onDeletePage(page: Page) {
        if (this.selectedDirectory !== null) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("Deleting a page is a permanent step. Select OK to proceed",
                async (r) => {
                    if (r === PopupMessageResult.ok) {
                        await this.editorService.deletePage(page, this.selectedDirectory!);
                        await this.reloadContent();
                    }
                }, options);
            //this.message = "Deleting a page is a permanent step. Select OK to proceed";
            //let r = await this.modalDialogService.showMessageBox("confirmBox");
            //if (r === MessageBoxResult.ok) {
            //    let sr = await this.editorService.deletePage(page, this.selectedDirectory);
            //    await this.reloadContent();
            //}  
        }
    }
    onAddNewPage() {
        if (this.selectedDirectory !== null) {
            this.newPage = new NewPage();
            this.newPage.directoryId = this.selectedDirectory.id;
            this.newPage.name = "";
            this.newPage.type = PageType.Centre;
            this.newPagePopup.open(async (r: boolean) => {
                if (r === true) {
                    console.log(`creating a page called ${this.newPage.name}`);
                    let sr = await this.editorService.createPage(this.newPage!);
                    if (!sr.success) {
                        let options = new PopupMessageOptions();
                        options.warning = true;
                        this.popupMessage.open(sr.errors, noop, options);
                        return false;
                    } else {
                        this.reloadContent();
                    }
                }
                this.newPage = new NewPage();
                return true;
            });
        }
    }
    onCancelNewPage() {
        this.newPagePopup.close(false);
        //this.modalDialogService.close("new-page");
    }
    async onCreateNewPage() {
        if (await this.newPagePopup.isValid()) {
            this.newPagePopup.close(true);
        }
        //if (this.newPage != null) {
        //    if (await this.modalDialogService.isValid("new-page")) {
        //        let sr = await this.editorService.createPage(this.newPage);
        //        if (!sr.success) {
        //            this.message = sr.errors[0];
        //            await this.modalDialogService.showMessageBox("warningBox");
        //        } else {
        //            this.reloadContent();
        //            this.newPage = null;
        //            this.modalDialogService.close("new-page");
        //        }
        //    } else {
        //        console.log("onCreateNewPage(): form not valid");
        //    }
        //}
    }

    getNewDirectoryCaption(): string {
        if (this.selectedDirectory !== null) {
            return `New Subdirectory (of ${this.selectedDirectory.name})`;
        }
        return "";
    }
    getNewPageCaption(): string {
        if (this.selectedDirectory !== null) {
            return `New Page (in ${this.selectedDirectory.name})`;
        }
        return "";
    }
    getImageCaption(): string {
        if (this.imageOnView) {
            return this.imageOnView.url;
        } else {
            return '';
        }
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
    directoryNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log(`directoryNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a directory name is required`;
            } else {
                let text = <string>value;
                if (text.length < 4) {
                    vr.valid = false;
                    vr.message = `a directory name must be at 4 characters long`;
                }
            }
            resolve(vr);
        });
    }
    pageNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log(`newPageNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a page name is required`;
            }
            resolve(vr);
        });
    }
    onUploadFiles() {
        this.uploadFiles.open(() => {
            this.reloadContent();
        });
    }

    async onStartFileUpload(filesToUpload: FileUploadItem[]) {
        console.log(`${filesToUpload.length} files to upload`);
        this.uploadFiles.uploadInProgress = true;
        for (let item of filesToUpload) {
            let r = await this.editorService.checkContentExists(this.selectedDirectory!.id, item.file.name);
            if (!r) {
                await this.uploadFile(item);
            } else {
                this.message = `${item.file.name} will not be uploaded as it already exists in folder ${this.selectedDirectory!.name}.`;
                let options = new PopupMessageOptions();
                options.warning = true;
                this.popupMessage.open(`${item.file.name} will not be uploaded as it already exists in folder ${this.selectedDirectory!.name}.`,
                    () => {
                        this.uploadFiles.remove(item);
                    });
            }
        }
        this.uploadFiles.uploadInProgress = false;
    }
    //onCancelFileUpload() {
    //    //this.filesToUpload = [];
    //    //this.uploadInProgress = false;
    //    //this.modalDialogService.close("upload-files");
    //}
    onPageProperties(page: Page) {
        //this.pageProperties.currentPage = page;
        this.pageProperties.open(page);
    }
    private async reload() {
        this.subdirectory = new Directory();
        //this.subdirectory.name = "";
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
    async uploadFile(fui: FileUploadItem) {
        console.log(`Starting file ${fui.file.name}, type ${fui.file.type}`);
        let upd = new UploadData();
        upd.filename = fui.file.name;
        upd.filelength = fui.file.size;
        upd.directoryId = this.selectedDirectory!.id;
        upd.mimeType = fui.file.type;
        let bytesSent = 0;
        let cr = new Base64ChunkReader(fui.file);
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
        });
    }
}
const chunkLength = 8192;
