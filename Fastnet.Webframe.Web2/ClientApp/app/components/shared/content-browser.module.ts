import { NgModule } from '@angular/core';

import { ContentBrowserComponent } from './content-browser.component';
import { PagePropertiesComponent } from './page-properties.component';
import { DirectoryPropertiesComponent } from './directory-properties.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from '../../fastnet/controls/controls.module';
import { UploadFilesModule } from '../../fastnet/uploader/upload-files.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ControlsModule,
        UploadFilesModule
    ],
    exports: [
        ContentBrowserComponent,
        PagePropertiesComponent,
        DirectoryPropertiesComponent
    ],
    declarations: [
        ContentBrowserComponent,
        PagePropertiesComponent,
        DirectoryPropertiesComponent
    ],
    providers: [],
})
export class ContentBrowserModule { }
