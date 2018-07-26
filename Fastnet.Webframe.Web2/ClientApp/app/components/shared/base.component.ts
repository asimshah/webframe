import { MessageBox } from "./common.types";
import { ModalDialogService } from "../modaldialog/modal-dialog.service";

export class BaseComponent {
    protected messageBox: MessageBox;
    constructor(protected dialogService: ModalDialogService) {

    }
    showMessageDialog(message: string, isAlert: boolean = false, caption: string = "Message") {
        this.messageBox = new MessageBox();
        this.messageBox.isAlert = isAlert;
        this.messageBox.caption = caption;
        this.messageBox.message = message;
        this.dialogService.open('message-box');
    }
    showConfirmDialog(message: string, onClose: (r: boolean) => void, isAlert: boolean = false, caption: string = "Message") {
        this.messageBox = new MessageBox();
        this.messageBox.isAlert = isAlert;
        this.messageBox.caption = caption;
        this.messageBox.message = message;
        this.messageBox.confirmBox = true;
        this.messageBox.confirmClose = onClose;
        this.dialogService.open('message-box');
    }
    onCloseMessageBox() {
        this.dialogService.close('message-box');
    }
    onConfirmMessageBox(r: boolean) {
        this.dialogService.close('message-box');
        this.messageBox.confirmClose(r);
    }
}