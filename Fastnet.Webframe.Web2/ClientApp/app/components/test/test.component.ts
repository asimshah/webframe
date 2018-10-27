import { Component,  AfterViewInit, ViewChild } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import { PopupDialogComponent } from '../../fastnet/controls/popup-dialog.component';
import { PopupMessageComponent } from '../../fastnet/controls/popup-message.component';

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements AfterViewInit {
    @ViewChild(PopupDialogComponent) popupDialog: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) message: PopupMessageComponent;
    constructor(private sanitizer: DomSanitizer) {
        console.log("constructor()");
    }

    ngAfterViewInit() {
        //this.lastNameInput.focus();
    }
    showPopup() {
        this.popupDialog.open(() => { });
    }
    showMessage() {
        this.message.open("hello world", () => { });
    }
}
