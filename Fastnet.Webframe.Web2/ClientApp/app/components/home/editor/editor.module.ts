import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageModule } from '../../page/page.module';
import { ControlsModule } from "../../controls/controls.module";
import { ModalDialogModule } from '../../modaldialog/modal-dialog.module';
import { EditorComponent } from './editor.component';
import { editorRouting } from './editor.routing';
import { ContentBrowserComponent } from './content-browser.component';
import { EditorService } from './editor.service';
import { PagePropertiesComponent } from './page-properties.component';
//import { TreeModule } from 'angular-tree-component';
//import { SidebarMenuComponent } from '../sidebarmenu.component';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        editorRouting,
        PageModule,
        ControlsModule,
        ModalDialogModule,
        //TreeModule
    ],
    exports: [],
    declarations: [EditorComponent, ContentBrowserComponent, PagePropertiesComponent],
    providers: [EditorService],
})
export class EditorModule { }
