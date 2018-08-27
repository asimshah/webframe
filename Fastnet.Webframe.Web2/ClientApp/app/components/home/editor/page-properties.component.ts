
import { Component, Input, ElementRef } from '@angular/core';
import { Page, Directory, Content, EditorService } from './editor.service';
import { ModalDialogComponent } from '../../modaldialog/modal-dialog.component';
import { ModalDialogService } from '../../modaldialog/modal-dialog.service';
import { ControlState, ValidationResult, PropertyValidatorAsync } from '../../controls/controls.types';

@Component({
    selector: 'page-properties',
    templateUrl: './page-properties.component.html',
    styleUrls: ['./page-properties.component.scss']
})
export class PagePropertiesComponent extends ModalDialogComponent {
    @Input() existingContent: Content;
    page: Page;
    //directory: Directory;
    pageNameValidator = new PropertyValidatorAsync((cs) => this.pageNameValidatorAsync(cs));
    existingNames: string[]; 
    originalPageName: string;
    originalLandingPage: boolean;
    message: string;
    constructor(private editorService: EditorService, modalDialogService: ModalDialogService, element: ElementRef) {
        super(modalDialogService, element);
    }
    open() {
        this.existingNames = this.getExistingNames();
        this.saveOriginalValues();
        this.modalDialogService.open(this.id);
    }
    async onSave() {
        if (this.hasChanged() && this.modalDialogService.isValid(this.id)) {
            let sr = await this.editorService.updatePage(this.page);
            if (sr.success) {
                this.message = "Page saved";
                await this.modalDialogService.showMessageBox("messageBox");
                this.modalDialogService.close(this.id);
                
            } else {
                this.message = sr.errors[0];
                await this.modalDialogService.showMessageBox("warningBox");
            }
        } 
    }
    onCancel() {
        this.restoreOriginalValues();
        this.modalDialogService.close(this.id);
    }
    getCaption() {
        return `${this.page.url} Properties`;
    }
    pageNameValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        console.log(`newPageNameValidatorAsync`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = cs.validationResult;
            let text = (<string>cs.value || "").trim();
            if (text.length === 0) {
                vr.valid = false;
                vr.message = `a page name is required`;
            } else {
                if (this.existingNames.some((v) => v.toLowerCase() === text)) {
                    vr.valid = false;
                    vr.message = `this name is already in use`;
                }
            }
            resolve(cs.validationResult);
        });
    }
    private saveOriginalValues() {
        this.originalPageName = this.page.name;
        this.originalLandingPage = this.page.landingPage;
    }
    private restoreOriginalValues() {
        this.page.name = this.originalPageName;
        this.page.landingPage = this.originalLandingPage;
    }
    private hasChanged(): boolean {
        return this.page.name !== this.originalPageName || this.page.landingPage !== this.originalLandingPage;
    }
    private getExistingNames(): string[] {
        let names: string[] = [];
        for (let p of this.existingContent.pages) {
            if (p.id != this.page.id) {
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
