import { NgModule } from '@angular/core';

import { DesignerComponent } from './designer.component';
import { routing } from './designer.routing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../page/page.module';
import { DesignerService } from './designer.service';
import { ControlsModule } from '../../fastnet/controls/controls.module';
import { ContentBrowserModule } from '../shared/content-browser.module';
import { EditorService } from '../shared/editor.service';
import { AceEditorModule } from 'ng2-ace-editor';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule,
        ContentBrowserModule,
        AceEditorModule
    ],
    exports: [],
    declarations: [
        DesignerComponent,
        //ContentBrowserComponent,
        //PagePropertiesComponent,
        //DirectoryPropertiesComponent,
    ],
    providers: [
        DesignerService,
        EditorService
    ],
})
export class DesignerModule { }


