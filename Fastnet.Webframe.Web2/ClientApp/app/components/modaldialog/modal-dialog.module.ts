import { NgModule } from "@angular/core";
import { ModalDialogComponent } from "./modal-dialog.component";
import { ModalDialogService } from "./modal-dialog.service";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        ModalDialogComponent
    ],
    declarations: [
        ModalDialogComponent
    ],
    providers: [
        ModalDialogService
    ]
})
export class ModalDialogModule {}