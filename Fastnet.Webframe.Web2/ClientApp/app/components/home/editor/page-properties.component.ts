
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { Page, Content, EditorService } from './editor.service';

import {  ValidationResult,  ValidationContext } from '../../controls/controls.types';
import { isNullorUndefinedorWhitespaceOrEmpty, ValidationMethod } from '../../controls/controlbase2.type';
import { PopupDialogComponent } from '../../controls/popup-dialog.component';
import { PopupMessageOptions, PopupMessageComponent } from '../../controls/popup-message.component';

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
    //pageNameValidator = new PropertyValidatorAsync((cs) => this.pageNameValidatorAsync(cs));
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
                        //this.message = "Page saved";
                        //await this.modalDialogService.showMessageBox("messageBox");
                        //this.modalDialogService.close(this.id);

                    } else {
                        let options = new PopupMessageOptions();
                        options.warning = true;
                        this.popupMessage.open(sr.errors, () => { });
                        //this.message = sr.errors[0];
                        //await this.modalDialogService.showMessageBox("warningBox");
                    }
                }

            } else {
                this.restoreOriginalValues();
            }
        });
        //this.modalDialogService.open(this.id);
    }
    async onSave() {
        if (await this.pagePropertiesDialog.isValid()) {
            this.pagePropertiesDialog.close(true);
        }
        //if (this.hasChanged() && this.modalDialogService.isValid(this.id)) {
        //    let sr = await this.editorService.updatePage(this.page);
        //    if (sr.success) {
        //        this.message = "Page saved";
        //        await this.modalDialogService.showMessageBox("messageBox");
        //        this.modalDialogService.close(this.id);

        //    } else {
        //        this.message = sr.errors[0];
        //        await this.modalDialogService.showMessageBox("warningBox");
        //    }
        //}
    }
    onCancel() {
        this.pagePropertiesDialog.close(false);
        //this.restoreOriginalValues();
        //this.modalDialogService.close(this.id);
    }
    getCaption(): string {
       return `${this.currentPage.url} Properties`;
       //return `Page Properties`;
    }
    pageNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log(`newPageNameValidatorAsync`);
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
            //let vr = cs.validationResult;
            //let text = (<string>cs.value || "").trim();
            //if (text.length === 0) {
            //    vr.valid = false;
            //    vr.message = `a page name is required`;
            //} else {
            //    if (this.existingNames.some((v) => v.toLowerCase() === text)) {
            //        vr.valid = false;
            //        vr.message = `this name is already in use`;
            //    }
            //}
            //resolve(cs.validationResult);
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
