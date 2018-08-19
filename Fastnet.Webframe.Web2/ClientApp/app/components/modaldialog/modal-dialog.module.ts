import { NgModule } from "@angular/core";
import { ModalDialogComponent } from "./modal-dialog.component";
import { ModalDialogService } from "./modal-dialog.service";
import { CommonModule } from "@angular/common";
import { MessageBoxComponent } from "./message-box.component";

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        ModalDialogComponent,
        MessageBoxComponent
    ],
    declarations: [
        ModalDialogComponent,
        MessageBoxComponent
    ],
    providers: [
        ModalDialogService
    ]
})
export class ModalDialogModule {}