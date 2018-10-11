import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../../page/page.module';
import { EditorComponent } from './editor.component';
import { editorRouting } from './editor.routing';
import { UploadFilesModule } from '../../../fastnet/uploader/upload-files.module';
import { ControlsModule } from '../../../fastnet/controls/controls.module';
import { EditablePageComponent } from './editable-page.component';
import { PageEditorComponent } from './page-editor.component';
import { TinyMCEModule } from '../../../fastnet/tinymce/tinymce.module';
import { InsertLinkComponent } from './insert-link.component';
import { InsertImageComponent } from './insert-image.component';
import { EditorService } from '../../shared/editor.service';
//import { ContentBrowserComponent } from '../../shared/content-browser.component';
//import { PagePropertiesComponent } from '../../shared/page-properties.component';
//import { DirectoryPropertiesComponent } from '../../shared/directory-properties.component';
import { ContentBrowserModule } from '../../shared/content-browser.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        editorRouting,
        PageModule,
        ControlsModule,
        UploadFilesModule,
        TinyMCEModule,
        ContentBrowserModule,

        //AceEditorModule
    ],
    exports: [],
    declarations: [
        EditorComponent,
        //ContentBrowserComponent,
        //PagePropertiesComponent,
        //DirectoryPropertiesComponent,
        EditablePageComponent,
        PageEditorComponent,
        InsertLinkComponent,
        InsertImageComponent
    ],
    providers: [EditorService],
})
export class WebframeEditorModule { }
