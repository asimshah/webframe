
import { ModalDialogService, MessageBox } from "../modaldialog/modal-dialog.service";
import { OnInit } from "@angular/core";
import { PageService } from "./page.service";
import { ValidationResult, ControlState } from "../controls/controls.types";

export  function nothingOnClose (r: boolean) { };

export class BaseComponent  implements OnInit{
    protected bannerPageId: number | null;
    constructor(protected pageService: PageService, protected dialogService: ModalDialogService) {

    }
    async ngOnInit() {
        console.log("BaseComponent: ngOnInit");
        this.bannerPageId = await this.pageService.getDefaultBanner();
    }
    getPageId() {
        return this.bannerPageId;
    }

    passwordValidatorAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = cs.validationResult;
            let text: string = cs.value || "";
            if (text.trim().length === 0) {
                vr.valid = false;
                vr.message = `a password is required`;
            } else {
                if (text.trim().length < 8) {
                    vr.valid = false;
                    vr.message = "minimum password length is 8 chars"
                }
            }
            resolve(vr);
        });
    }
}