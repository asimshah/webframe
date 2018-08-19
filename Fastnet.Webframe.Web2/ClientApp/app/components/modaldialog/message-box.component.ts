import { Component, ElementRef, Input, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit, AfterViewChecked, Output, EventEmitter } from '@angular/core';

import { ModalDialogService, MessageBox, IOpenWithClose } from './modal-dialog.service';
import { getOriginalError } from '@angular/core/src/errors';
import { Subject } from 'rxjs/Subject';
import { ModalDialogComponent } from './modal-dialog.component';

export enum MessageBoxResult {
    ok,
    cancel
}
// [ngClass]="{'error': messageBox.isAlert}"
                //<div *ngIf="messageBox.confirmBox === false">
                //    <button class="default" (click)="onCloseMessageBox()">OK</button>
                //</div>
@Component({
    selector: 'message-box',
    template: `<div class="modal-overlay">
        <div class="modal-container">
            <div class="form-body">
                <div class="caption" [ngClass]="{'warning': warning}" >{{caption}}</div>
                <div class="message-body" ><ng-content></ng-content></div>
            </div>
            <div class="command-buttons align-centrally">                
                <div *ngIf="allowCancel" >
                    <button (click)="onOKMessageBox()">{{okLabel}}</button>
                    <button class="cancel" (click)="onCancelMessageBox()">{{cancelLabel}}</button>
                </div>
                <div *ngIf="!allowCancel" >
                    <button  (click)="onOKMessageBox()">{{okLabel}}</button>
                </div>
            </div>
        </div>
    </div>`,
    styleUrls: ['./modal-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None // turn off ViewEncapsulation so that we can set html, body, etc., globally
})
export class MessageBoxComponent extends ModalDialogComponent implements IOpenWithClose {
    @Input() id: string;
    @Input() caption: string = "System Message";
    @Input() allowCancel: boolean = false;
    @Output() close = new EventEmitter<MessageBoxResult>();
    @Input() okLabel: string = "OK";
    @Input() cancelLabel: string = "Cancel";
    @Input() warning: boolean = false;
    private onClose?: (r: MessageBoxResult) => void;
    constructor(modalDialogService: ModalDialogService, el: ElementRef) {
        super(modalDialogService, el);
        this.element = el.nativeElement;
    }
    openWithClose(depth: number, onClose?: (r: MessageBoxResult) => void) {
        //console.log(`openWithClose() called`);
        this.onClose = onClose;
        super.openDialog(depth);
    }
    onCancelMessageBox() {
        if (this.onClose) {
            this.onClose(MessageBoxResult.cancel);
        } else {
            this.close.emit(MessageBoxResult.cancel);
        }
        this.modalDialogService.close(this.id);
    }
    onOKMessageBox() {
        if (this.onClose) {
            this.onClose(MessageBoxResult.ok);
        } else {
            this.close.emit(MessageBoxResult.ok);
        }
        this.modalDialogService.close(this.id);
    }

}

