import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../../page/page.module';
import { EditorComponent } from './editor.component';
import { editorRouting } from './editor.routing';
import { ContentBrowserComponent } from './content-browser.component';
import { EditorService } from './editor.service';
import { PagePropertiesComponent } from './page-properties.component';
import { UploadFilesModule } from '../../../fastnet/uploader/upload-files.module';
import { ControlsModule } from '../../../fastnet/controls/controls.module';
import { DirectoryPropertiesComponent } from './directory-properties.component';
import { EditablePageComponent } from './editable-page.component';
import { PageEditorComponent } from './page-editor.component';
import { TinyMCEModule } from '../../../fastnet/tinymce/tinymce.module';
import { InsertLinkComponent } from './insert-link.component';
import { InsertImageComponent } from './insert-image.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        editorRouting,
        PageModule,
        ControlsModule,
        UploadFilesModule,
        TinyMCEModule,

        //AceEditorModule
    ],
    exports: [],
    declarations: [
        EditorComponent,
        ContentBrowserComponent,
        PagePropertiesComponent,
        DirectoryPropertiesComponent,
        EditablePageComponent,
        PageEditorComponent,
        InsertLinkComponent,
        InsertImageComponent
    ],
    providers: [EditorService],
})
export class WebframeEditorModule { }
