import { Component, ViewEncapsulation } from '@angular/core';

import { ModalDialogService } from '../modaldialog/modal-dialog.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['../../styles/webframe.scss', './app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    constructor(private dialogService: ModalDialogService) {

    }
    onTestClick(): void {
        this.dialogService.open("test-modal");
    }
    closeTestDialog(): void {
        this.dialogService.close("test-modal");
    }
}
