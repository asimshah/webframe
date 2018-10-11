import { Component, ViewChild } from '@angular/core';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
//import { ContentBrowserComponent, SelectedItem, SelectableContent } from './content-browser.component';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import {  isNullorUndefinedorWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase.type';
import { validateUrl, validateNumericNoLeadingZeroes } from '../../../fastnet/core/regex.functions';
import { ContentBrowserComponent, SelectedItem, SelectableContent } from '../../shared/content-browser.component';

@Component({
    selector: 'insert-image',
    templateUrl: './insert-image.component.html',
    styleUrls: ['./insert-image.component.scss']
})
export class InsertImageComponent {
    @ViewChild(PopupDialogComponent) popupDialog: PopupDialogComponent;
    @ViewChild(ContentBrowserComponent) contentBrowser: ContentBrowserComponent;
    imageUrl: string;
    imageWidth: number;
    imageHeight: number;
    imageScale: number;
    linkUrl: string;
    imageIsLink: boolean = false;
    constructor() {
    }
    open(onClose: (imageUrl: string, height: number, width: number, linkUrl?: string) => void) {
        this.imageUrl = "";
        this.imageHeight = this.imageWidth = 0;
        this.linkUrl = "";
        this.popupDialog.open((r: boolean) => {
            if (r === true) {
                if (this.imageIsLink) {
                    onClose(this.imageUrl, (this.imageHeight * this.imageScale) / 100, (this.imageWidth * this.imageScale) / 100, this.linkUrl);
                } else {
                    onClose(this.imageUrl, (this.imageHeight * this.imageScale) / 100, (this.imageWidth * this.imageScale) / 100);
                }
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
    onContentBrowserForImage() {
        this.contentBrowser.openForSelection(SelectableContent.ImagesOnly, (si?: SelectedItem) => {
            if (si) {
                console.log(`closed with ${JSON.stringify(si, null, 2)}`);
                this.imageUrl = si.url;
                this.imageWidth = si.width!;
                this.imageHeight = si.height!;
                if (this.imageWidth > 500) {
                    this.imageScale = 50;
                } else {
                    this.imageScale = 75;
                }
                //this.imageSize = `${si.width}w x ${si.height}h`;
            }
        });
    }
    onContentBrowserForLink() {
        this.contentBrowser.openForSelection(SelectableContent.PagesAndDocuments, (si?: SelectedItem) => {
            if (si) {
                //console.log(`closed with ${JSON.stringify(si, null, 2)}`);
                this.linkUrl = si.url;
            }
        });
    }
    imageUrlPresent(): boolean {
        let r = false;
        if (this.imageUrl && this.imageUrl.length > 0) {
            r = true;
        }
        return r;
    }
    imageDimensionsPresent(): boolean {
        let r = false;
        if (this.imageWidth && this.imageWidth > 0) {
            r = true;
        }
        return r;
    }
    canInsert(): boolean {
        let r = false;
        if (this.imageIsLink) {
            if (this.imageUrl && this.linkUrl) {
                r = this.imageUrl.length > 0 && this.linkUrl.length > 0;
            }
        } else {
            if (this.imageUrl) {
                r = this.imageUrl.length > 0;
            }
        }
        return r;
    }
    validateImageUrl(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log('validateLinkUrl');
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `link url is required`;
            } else {
                let url = (value as string);
                if (url.startsWith("image/")) {
                    let t = url.indexOf("/");
                    let numberPart = url.substr(t + 1);
                    //let re = /^(?:[1-9]\d*|\d)$/;// new RegExp("^[1-9]+[0-9]*/$");
                    if (!validateNumericNoLeadingZeroes(numberPart) || +numberPart < 1) {
                        vr.valid = false;
                        vr.message = `this is not a valid url`;
                    }
                }
                else  {
                    vr.valid = false;
                    vr.message = `this is not a valid url`;
                }
            }
            resolve(vr);
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
