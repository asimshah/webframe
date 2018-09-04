import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PopupDialogComponent } from './popup-dialog.component';

export enum PopupMessageResult {
    ok,
    cancel
}
export class PopupMessageOptions {
    caption?: string;
    okLabel?: string;
    cancelLabel?: string;
    allowCancel?: boolean;
    warning?: boolean;
    error?: boolean;
    width?: number; // always px
}

export type PopupMessageCloseHandler = (r: PopupMessageResult) => void;

@Component({
    selector: 'popup-message',
    templateUrl: './popup-message.component.html',
    styleUrls: ['./popup-message.component.scss']
})
export class PopupMessageComponent implements OnInit {
    PopupMessageResult: PopupMessageResult;
    @ViewChild('popupdialog') popup: PopupDialogComponent;
    @Input() width?: number;
    caption: string = "System Message";
    okLabel: string = "OK";
    cancelLabel: string = "Cancel";
    allowCancel: boolean = false;
    messages: string | string[];
    warning: boolean = false;
    error: boolean = false;
    isSingleMessage: boolean = true;
    closeHandler: PopupMessageCloseHandler;
    constructor() {

    }
    ngOnInit(): void {
        //if (typeof this.messages === "string") {
        //    this.isSingleMessage = true;
        //} else {
        //    this.isSingleMessage = false;
        //}
    }
    open(messages: string | string[], onClose: PopupMessageCloseHandler, options?: PopupMessageOptions) {
        this.messages = messages;
        if (typeof this.messages === "string") {
            this.isSingleMessage = true;
        } else {
            this.isSingleMessage = false;
        }
        this.closeHandler = onClose;
        this.popup.unsetWidth();
        if (options) {
            if (options.caption) {
                this.caption = options.caption;
            }
            if (options.okLabel) {
                this.okLabel = options.okLabel;
            }
            if (options.cancelLabel) {
                this.cancelLabel = options.cancelLabel;
            }

            if (options.allowCancel) {
                this.allowCancel = options.allowCancel;
            }
            if (options.warning) {
                this.warning = options.warning;
            }
            if (options.error) {
                this.error = options.error;
            }
            if (options.width) {
                this.popup.setWidth(options.width);
            }
        }
        this.popup.open((a) => this.popupClosed(a));
    }
    onOk() {
        this.popup.close(PopupMessageResult.ok);
    }
    onCancel() {
        this.popup.close(PopupMessageResult.cancel);
    }

    popupClosed(arg: PopupMessageResult): void {
        this.closeHandler(arg);
    }
}
