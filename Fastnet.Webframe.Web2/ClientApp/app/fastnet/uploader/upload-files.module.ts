import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../../components/controls/controls.module';
import { UploadDialogComponent } from './upload-files.component';
class fileUploadItem {
    file: File;
    progress: number;
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ControlsModule
    ],
    exports: [UploadDialogComponent],
    declarations: [UploadDialogComponent],
    providers: [],
})
export class UploadFilesModule {
    filesToUpload: fileUploadItem[] = [];
}
