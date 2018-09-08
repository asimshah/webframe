import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../../page/page.module';
//import { ControlsModule } from "../../controls/controls.module";
import { EditorComponent } from './editor.component';
import { editorRouting } from './editor.routing';
import { ContentBrowserComponent } from './content-browser.component';
import { EditorService } from './editor.service';
import { PagePropertiesComponent } from './page-properties.component';
import { UploadFilesModule } from '../../../fastnet/uploader/upload-files.module';
import { ControlsModule } from '../../../fastnet/controls/controls.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        editorRouting,
        PageModule,
        ControlsModule,
        UploadFilesModule
    ],
    exports: [],
    declarations: [EditorComponent, ContentBrowserComponent, PagePropertiesComponent],
    providers: [EditorService],
})
export class EditorModule { }
