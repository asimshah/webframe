import { Injectable } from '@angular/core';
import { ModalDialogComponent } from './modal-dialog.component';
import { ControlBase } from '../controls/controls.component';

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
            m.open(this.openModalsCount);
            if (name) {
                ControlBase.focus(name);
            }
            //return m;
        } else {
            alert(`no modal-dialog found with id ${id}`)
        }
        //return m as ModalDialogComponent;
    }
    //public async openAndWait<M extends IWaitOnResult>(id: string, model: M, name: string | undefined = undefined): Promise<void> {
    //    console.log(`ModalDialogService: open() with ${id}, focus on ${name}`);
    //    let m = this.modals.find((item) => item.id === id);
    //    if (m !== undefined) {
    //        this.openModalsCount++;
    //        console.log(`opening (with wait) modal ${id}, depth is ${this.openModalsCount}`);
    //        m.openAndWait(model, this.openModalsCount);
    //        if (name) {
    //            ControlBase.focus(name);
    //        }
    //    }
    //}
    public close(id: string): void {
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined) {
            m.close();
            --this.openModalsCount;
        }
    }
}