import { Injectable } from '@angular/core';
import { ModalDialogComponent } from './modal-dialog.component';
import { ControlBase } from '../controls/controls.component';
import { MessageBoxResult, MessageBoxComponent } from './message-box.component';
//import { MessageBoxResult, MessageBoxComponent } from './message-box.component';

export interface IOpenWithClose {
    openWithClose(depth: number, onClose?: (r: MessageBoxResult) => void): void;
}
export class MessageBox {
    caption: string = "Message";
    isAlert: boolean = false;
    message: string = "<div>No message provided</div>";
    confirmBox: boolean = false;
    confirmClose: (r: boolean) => void;
}

@Injectable()
export class ModalDialogService {
    private openModalsCount: number = 0;
    private modals: ModalDialogComponent[] = [];
    public add(modal: ModalDialogComponent): void {
        this.modals.push(modal);
        //console.log(`ModalDialogService: modal ${modal.id} added, modals length = ${this.modals.length}`);
    }
    public remove(id: string): void {
        let m = this.modals.findIndex((item) => item.id === id);
        this.modals.splice(m, 1);
        //console.log(`ModalDialogService: modal ${id} removed, modals length = ${this.modals.length}`);
    }
    public open(id: string, name: string | undefined = undefined) {
        //console.log(`ModalDialogService: open() with ${id}, focus on ${name}`);
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined) {
            this.openModalsCount++;
            //console.log(`opening modal ${id}, depth is ${this.openModalsCount}`);
            m.openDialog(this.openModalsCount);
            if (name) {
                ControlBase.focus(name);
            }
        } else {
            alert(`no modal-dialog found with id ${id}`)
        }
    }
    public close(id: string): void {
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined) {
            m.closeDialog();
            --this.openModalsCount;
        }
    }
    public showMessageBox(id: string, onClose?: (r: MessageBoxResult) => void) {
        //console.log(`ModalDialogService: open() with ${id}, focus on ${name}`);
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined && this.isIOpenDialogWithClosure(m)) {            
            this.openModalsCount++;
            //console.log(`opening message-box ${id}, depth is ${this.openModalsCount}`);
            let mx: IOpenWithClose = m;
            mx.openWithClose(this.openModalsCount, onClose);
            if (name) {
                ControlBase.focus(name);
            }
        } else {
            alert(`no message-box found with id ${id}`)
        }
    }
    private isIOpenDialogWithClosure(object: any): object is IOpenWithClose {
        return (<MessageBoxComponent>object).openWithClose !== undefined;
    }
}