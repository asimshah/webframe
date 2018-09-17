import { Component, ViewChild, Input } from '@angular/core';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageResult } from '../../../fastnet/controls/popup-message.component';
import { Directory, EditorService, Content, DirectoryAccess, AccessRights } from './editor.service';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import { isNullorUndefinedorWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase.type';

@Component({
    selector: 'directory-properties',
    templateUrl: './directory-properties.component.html',
    styleUrls: ['./directory-properties.component.scss']
})
export class DirectoryPropertiesComponent {
    @ViewChild('directoryPropertiesDialog') private directoryPropertiesDialog: PopupDialogComponent;
    @ViewChild('accessListDialog') private accessListDialog: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @Input() existingContent: Content;
    currentDirectory: Directory;
    name: string;
    directoryAccess: DirectoryAccess;
    accessList: AccessRights[] = [];
    originalDirectoryName: string;
    originalDirectoryAccess: string;
    existingNames: string[];
    constructor(private editorService: EditorService) {

    }
    getCaption(): string {
        return `${this.currentDirectory.name} Properties`;
    }
    async onChangeRestrictions() {
        this.accessList = await this.editorService.getDirectoryAccessByGroups(this.currentDirectory);
        for (let dr of this.directoryAccess.directRights) {
            // why do i do this?
            // because you can reopen the accessListDialog having previously
            // made some selection but having not yet saved it...
            let ar = this.accessList.find(x => x.group.groupId === dr.group.groupId);
            if (ar && ar.selected === false) {
                ar.selected = true;
            }
        }
        this.accessListDialog.open(async (r: boolean) => {
            if (r === true) {
                this.directoryAccess.directRights = [];
                for (let x of this.accessList) {
                    if (x.selected) {
                        this.directoryAccess.directRights.push(x);
                    }
                }
            } else {
                // restoer list in case of changes
                this.accessList = await this.editorService.getDirectoryAccessByGroups(this.currentDirectory);
            }
        });
        for (let x of this.accessList) {
            console.log(`${JSON.stringify(x, null, 2)}`);
        }
    }
    async onSave() {
        if (await this.directoryPropertiesDialog.isValid()) {
            this.directoryPropertiesDialog.close(true);

        }
    }
    onCancel() {
        if (this.hasChanged) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("There are chnages that have not been saved. Press OK to discard these changes.", (r) => {
                if (r === PopupMessageResult.ok) {
                    this.directoryPropertiesDialog.close(false);
                }
            }, options);
        } else {
            this.directoryPropertiesDialog.close(false);
        }
    }
    async open(dir: Directory) {
        this.currentDirectory = dir;
        this.name = dir.name;
        this.directoryAccess = await this.editorService.getDirectoryAccess(this.currentDirectory);
        //console.log(`${JSON.stringify(this.directAccess, null, 2)}`);
        this.existingNames = this.getExistingNames();
        this.saveOriginalValues();
        this.directoryPropertiesDialog.open(async (r: boolean) => {
            if (r === true) {
                if (this.hasChanged()) {
                    let hasFailed = false;
                    if (this.originalDirectoryName !== this.currentDirectory.name) {
                        let sr = await this.editorService.updateDirectory(this.currentDirectory);
                        if (sr.success === false) {                            
                            hasFailed = true;
                            let options = new PopupMessageOptions();
                            options.warning = true;
                            this.popupMessage.open(sr.errors, () => { });
                        }
                    }
                    if (hasFailed === false && this.originalDirectoryAccess != JSON.stringify(this.directoryAccess)) {
                        // update the restrictions
                        let sr = await this.editorService.updateDirectoryAccess(this.directoryAccess);
                        if (sr.success === false) {
                            hasFailed = true;
                            let options = new PopupMessageOptions();
                            options.warning = true;
                            this.popupMessage.open(sr.errors, () => { });
                        }
                    }
                    if (hasFailed === false) {
                        this.popupMessage.open("Directory saved", () => { });
                    } 
                }
            } else {
                this.restoreOriginalValues();
            }
        });
    }
    getRightsDescription(r: AccessRights) {
        if (r.view === true && r.edit === true) {
            return "view+edit";
        } else if (r.view === true) {
            return "view only";
        } else if (r.edit === true) {
            return "edit only";
        }
        else {
            return "none"; // can't happen
        }
    }
    onSaveAccessList() {
        this.accessListDialog.close(true);
    }
    onCancelAccessList() {
        this.accessListDialog.close(false);
    }

    directoryNameValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefinedorWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = `a directory name is required`;
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
    private hasChanged(): boolean {
        return this.currentDirectory.name !== this.originalDirectoryName || this.originalDirectoryAccess != JSON.stringify(this.directoryAccess);
    }
    private saveOriginalValues() {
        this.originalDirectoryName = this.currentDirectory.name;
        this.originalDirectoryAccess = JSON.stringify(this.directoryAccess);

    }
    private restoreOriginalValues() {
        // only name needs to be resotred before closing
        this.currentDirectory.name = this.originalDirectoryName;
    }
    private getExistingNames(): string[] {
        let names: string[] = [];
        for (let p of this.existingContent.pages) {
            names.push(p.name.toLowerCase());
        }
        for (let d of this.existingContent.documents) {
            if (d.id != this.currentDirectory.id) {
                names.push(d.name.toLowerCase());
            }
        }
        for (let x of this.existingContent.images) {
            names.push(x.name.toLowerCase());
        }
        return names;
    }
}
