
import { Component, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PopupDialogComponent, PopupCloseHandler } from '../controls/popup-dialog.component';
//import { PopupDialogComponent, PopupCloseHandler } from '../../components/controls/popup-dialog.component';

export class FileUploadItem {
    file: File;
    progress: number;
}

enum uploadCommands {
    StartUpload,
    ClearList,
    AddFiles,
    Cancel
}

@Component({
    selector: 'upload-dialog',
    templateUrl: './upload-files.component.html',
    styleUrls: ['./upload-files.component.scss']
})
export class UploadDialogComponent {
    uploadCommands = uploadCommands;
    @ViewChild('popupdialog') popup: PopupDialogComponent;
    @ViewChild("fileInput") uploadInputElement: ElementRef;
    @Output() startUpload = new EventEmitter<FileUploadItem[]>();
    filesToUpload: FileUploadItem[] = [];
    uploadInProgress = false;
    constructor(private changeDetector: ChangeDetectorRef) {

    }
    open(onClose: PopupCloseHandler) {
        this.uploadInputElement.nativeElement.value = "";
        this.filesToUpload = [];
        //console.log("open");
        this.popup.open(() => {
            this.uploadInputElement.nativeElement.value = "";
            onClose();
        });
    }
    onCancelFileUpload() {
        this.popup.close();
    }
    onFileSelected(e: any) {
        let element = <HTMLInputElement>e.target;
        //let file = <string>e.target.files[0];
        if (element.files) {
            var fl: FileList;
            for (let i = 0; i < element.files.length; ++i) {
                let file = element.files[i];
                //console.log(`${file.name} selected for upload, ${file.size}`);
                let item = new FileUploadItem();
                item.file = file;
                item.progress = 0;
                this.filesToUpload.push(item);
            }

        }
    }
    onStartFileUpload() {
        this.uploadInputElement.nativeElement.value = "";
        this.startUpload.emit(this.filesToUpload);
        //return new Promise<void>(async resolve => {
        //    if (this.filesToUpload.length > 0) {
        //        this.uploadInProgress = true;
        //        for (let item of this.filesToUpload) {
        //            let r = await this.editorService.checkContentExists(this.selectedDirectory!.id, item.file.name);
        //            if (!r) {
        //                await this.uploadFile(item);
        //            } else {
        //                this.message = `${item.file.name} will not be uploaded as it already exists in folder ${this.selectedDirectory!.name}.`;
        //                //await this.modalDialogService.showMessageBox("warningBox");
        //            }

        //        }
        //        this.reloadContent();
        //        setTimeout(() => {
        //            this.filesToUpload = [];
        //            this.uploadInProgress = false;
        //            //this.modalDialogService.close("upload-files");
        //            resolve();
        //        }, 2000);
        //    }
        //});
    }
    onClearList() {
        this.uploadInputElement.nativeElement.value = "";
        this.filesToUpload = [];
    }
    remove(item: FileUploadItem) {
        let index = this.filesToUpload.findIndex(x => x === item);
        this.filesToUpload.splice(index, 1);
    }

    canExecute(cmd: uploadCommands) {
        let r = false;
        if (!this.uploadInProgress) {
            switch (cmd) {
                case uploadCommands.StartUpload:
                case uploadCommands.ClearList:
                    r = this.filesToUpload.length > 0;
                    break;
                case uploadCommands.AddFiles:
                case uploadCommands.Cancel:
                    r = true;
                    break;
            }
        }
        return r;
    }
}
