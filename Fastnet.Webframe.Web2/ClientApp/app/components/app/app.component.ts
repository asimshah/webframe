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
        this.loadCustomCss();
    }
    onTestClick(): void {
        this.dialogService.open("test-modal");
    }
    closeTestDialog(): void {
        this.dialogService.close("test-modal");
    }
    private loadCustomCss() {
        // I can't load this css in the normal way using a link tag in the
        // _Layout.cshtml because all the remain styles are created as <style> elements by the angular environment
        // and added **after the end of the <head> containing element**
        // this means that these created styles take precedence over the custom.css which then
        // means that custom.css rules are overridden by the webframe rules built into the app
        // which is the reverse of what I require.
        // so I load it here at run time and put it in the right place (after all the other rules)
        try {
            let headElement: HTMLHeadElement = document.getElementsByTagName("head")[0];
            let customLink = document.createElement("link");
            customLink.rel = "stylesheet";
            customLink.href = "/css/custom.css";
            headElement.appendChild(customLink);
        } catch (e) {
            console.log("custom css not loaded")
        }
    }
}
