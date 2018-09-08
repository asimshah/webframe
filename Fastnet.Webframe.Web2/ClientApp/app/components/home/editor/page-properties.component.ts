
import { Component, Input, ViewChild } from '@angular/core';
import { Page, Content, EditorService } from './editor.service';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
import { PopupMessageComponent, PopupMessageOptions } from '../../../fastnet/controls/popup-message.component';
import { ValidationMethod, isNullorUndefinedorWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase2.type';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';

//import {  ValidationResult,  ValidationContext } from '../../controls/controls.types';
//import { isNullorUndefinedorWhitespaceOrEmpty, ValidationMethod } from '../../controls/controlbase2.type';
//import { PopupDialogComponent } from '../../controls/popup-dialog.component';
//import { PopupMessageOptions, PopupMessageComponent } from '../../controls/popup-message.component';

@Component({
    selector: 'page-properties',
    templateUrl: './page-properties.component.html',
    styleUrls: ['./page-properties.component.scss']
})
export class PagePropertiesComponent  {
    @ViewChild('pagePropertiesDialog') private pagePropertiesDialog: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @Input() existingContent: Content;
    currentPage: Page;
    pageNameValidator: ValidationMethod = (context, value) => this.pageNameValidatorAsync(context, value);
    name: string;
    existingNames: string[];
    originalPageName: string;
    originalLandingPage: boolean;
    message: string;
    constructor(private editorService: EditorService) {
    }
    open(page: Page) {
        this.currentPage = page;
        this.name = page.name;
        console.log(`${JSON.stringify(this.currentPage, null, 2)}`);
        this.existingNames = this.getExistingNames();
        this.saveOriginalValues();
        this.pagePropertiesDialog.open(async (r: boolean) => {
            if (r === true) {
                if (this.hasChanged()) {
                    let sr = await this.editorService.updatePage(this.currentPage);
                    if (sr.success) {
                        this.popupMessage.open("Page saved", () => { });
                    } else {
                        let options = new PopupMessageOptions();
                        options.warning = true;
                        this.popupMessage.open(sr.errors, () => { });
                    }
                }
            } else {
                this.restoreOriginalValues();
            }
        });
    }
    async onSave() {
        if (await this.pagePropertiesDialog.isValid()) {
            this.pagePropertiesDialog.close(true);
        }
    }
    onCancel() {
        this.pagePropertiesDialog.close(false);
    }
    getCaption(): string {
       return `${this.currentPage.url} Properties`;
       //return `Page Properties`;
    }
    pageNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        //console.log(`newPageNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a page name is required`;
            } else {
                let text = <string>value;
                if (this.existingNames.some((v) => v.toLowerCase() === text)) {
                    vr.valid = false;
                    vr.message = `this name is already in use`;
                }
            }
            resolve(vr);
        });
    }
    private saveOriginalValues() {
        this.originalPageName = this.currentPage.name;
        this.originalLandingPage = this.currentPage.landingPage;
    }
    private restoreOriginalValues() {
        this.currentPage.name = this.originalPageName;
        this.currentPage.landingPage = this.originalLandingPage;
    }
    private hasChanged(): boolean {
        return this.currentPage.name !== this.originalPageName || this.currentPage.landingPage !== this.originalLandingPage;
    }
    private getExistingNames(): string[] {
        let names: string[] = [];
        for (let p of this.existingContent.pages) {
            if (p.id != this.currentPage.id) {
                names.push(p.name.toLowerCase());
            }
        }
        for (let d of this.existingContent.documents) {
            names.push(d.name.toLowerCase());
        }
        for (let x of this.existingContent.images) {
            names.push(x.name.toLowerCase());
        }
        return names;
    }
}
