
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { TinyMCEComponent } from '../../fastnet/tinymce/tinymce.component';
import { PopupDialogComponent } from '../../fastnet/controls/popup-dialog.component';

@Component({
    selector: 'mce-test',
    templateUrl: './mcetest.component.html',
    styleUrls: ['./mcetest.component.scss']
})
export class MCETestComponent implements AfterViewInit {
    @ViewChild('ed1') ed1: TinyMCEComponent;
    @ViewChild(PopupDialogComponent) popup: PopupDialogComponent;
    @ViewChild('ed2') ed2: TinyMCEComponent;
    @ViewChild(TinyMCEComponent) mce: TinyMCEComponent;
    text: string = "<div>hello world</div>";
    modaltext: string = "<div>modal hello world</div>";
    constructor() {

    }
    ngAfterViewInit() {
        console.log(`ngAfterViewInit`);
    }
    onEd1Change(content: string) {
        console.log(`ed1 change: ${content}`);
    }
    onEd2Change(content: string) {
        console.log(`ed2 change: ${content}`);
    }
    buttonClick() {
        console.log('button click!');
        console.log(`${this.text}`);
        //this.popup.open(() => {
        //});
    }
    onModalSave() {
        console.log(`modal text: ${this.ed2.getContent()}`);
    }
    onModalCancel() {
        this.popup.close();
    }
}
