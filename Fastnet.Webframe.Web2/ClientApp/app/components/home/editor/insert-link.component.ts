import { Component, ViewChild } from '@angular/core';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
import { ContentBrowserComponent, SelectedItem, SelectableContent } from './content-browser.component';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import {  isNullorUndefinedorWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase.type';
import { validateUrl, validateNumericNoLeadingZeroes } from '../../../fastnet/core/regex.functions';

@Component({
    selector: 'insert-link',
    templateUrl: './insert-link.component.html',
    styleUrls: ['./insert-link.component.scss']
})
export class InsertLinkComponent {
    @ViewChild(PopupDialogComponent) popupDialog: PopupDialogComponent;
    @ViewChild(ContentBrowserComponent) contentBrowser: ContentBrowserComponent;
    linkUrl: string;
    linkText: string;
    constructor() {
    }
    open(onClose: (url: string, text: string) => void) {
        this.popupDialog.open((r: boolean) => {
            if (r === true) {
                if (!this.linkText || this.linkText.length == 0) {
                    this.linkText = this.linkUrl;
                }
                onClose(this.linkUrl, this.linkText);
            } else {

            }
        });
    }
    onCancel() {
        this.popupDialog.close(false);
    }
    onInsert() {
        if (this.popupDialog.isValid()) {
            this.popupDialog.close(true);
        }
    }
    onContentBrowser() {
        this.contentBrowser.openForSelection(SelectableContent.PagesAndDocuments, (si?: SelectedItem) => {
            if (si) {
                console.log(`closed with ${JSON.stringify(si, null, 2)}`);
                this.linkText = si.name;
                this.linkUrl = si.url;
            }
        });
    }
    validateLinkUrl(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log('validateLinkUrl');
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `link url is required`;
            } else {
                let url = (value as string);
                if (url.startsWith("page/") || url.startsWith("document/")) {
                    let t = url.indexOf("/");
                    let numberPart = url.substr(t + 1);
                    //let re = /^(?:[1-9]\d*|\d)$/;// new RegExp("^[1-9]+[0-9]*/$");
                    if (!validateNumericNoLeadingZeroes(numberPart) || +numberPart < 1 ) {
                        vr.valid = false;
                        vr.message = `this is not a valid url`;
                    }
                }
                else if (validateUrl(url) === false) {
                    vr.valid = false;
                    vr.message = `this is not a valid url`;
                }
            }
            resolve(vr);
        });
    }
}
