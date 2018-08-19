
import { ModalDialogService, MessageBox } from "../modaldialog/modal-dialog.service";
import { OnInit } from "@angular/core";
import { PageService } from "./page.service";
import { ValidationResult, ControlState } from "../controls/controls.component";

export  function nothingOnClose (r: boolean) { };

export class BaseComponent  implements OnInit{
    protected bannerPageId: number | null;
    //protected messageBox: MessageBox;
    constructor(protected pageService: PageService, protected dialogService: ModalDialogService) {

    }
    async ngOnInit() {
        console.log("BaseComponent: ngOnInit");
        this.bannerPageId = await this.pageService.getDefaultBanner();
    }
    getPageId() {
        return this.bannerPageId;
    }

    //showMessageDialog(message: string, onClose: (r: boolean) => void = nothingOnClose, isAlert: boolean = false, caption: string = "Message"): void {
    //    this.messageBox = new MessageBox();
    //    this.messageBox.isAlert = isAlert;
    //    this.messageBox.caption = caption;
    //    this.messageBox.message = message;
    //    this.messageBox.confirmClose = onClose;
    //    this.dialogService.open('message-box');
    //}
    //showConfirmDialog(message: string, onClose: (r: boolean) => void, isAlert: boolean = false, caption: string = "Message") {
    //    this.messageBox = new MessageBox();
    //    this.messageBox.isAlert = isAlert;
    //    this.messageBox.caption = caption;
    //    this.messageBox.message = message;
    //    this.messageBox.confirmBox = true;
    //    this.messageBox.confirmClose = onClose;
    //    this.dialogService.open('message-box');
    //}
    //onCloseMessageBox() {
    //    this.dialogService.close('message-box');
    //    this.messageBox.confirmClose(true);
    //}
    //onConfirmMessageBox(r: boolean) {
    //    this.dialogService.close('message-box');
    //    this.messageBox.confirmClose(r);
    //}
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