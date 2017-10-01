import { Injectable } from '@angular/core';
import { ModalDialogComponent } from './modal-dialog.component';

@Injectable()
export class ModalDialogService {
    private modals: ModalDialogComponent[] = [];
    public add(modal: ModalDialogComponent): void {
        this.modals.push(modal);
        console.log(`ModalDialogService: modal ${modal.id} added, modals length = ${this.modals.length}`);
    }
    public remove(id: string): void {
        let m = this.modals.findIndex((item) => item.id === id);
        this.modals.splice(m, 1);
        console.log(`ModalDialogService: modal ${id} removed, modals length = ${this.modals.length}`);
    }
    public open(id: string): void {
        console.log(`ModalDialogService: open() with ${id}`);
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined) {
            console.log(`opening modal ${id}`);
            m.open();
        }
    }
    public close(id: string): void {
        let m = this.modals.find((item) => item.id === id);
        if (m !== undefined) {
            m.close();
        }
    }
}