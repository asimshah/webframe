﻿import { Component, ElementRef, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { ModalDialogService } from './modal-dialog.service';
import { getOriginalError } from '@angular/core/src/errors';
import { Subject } from 'rxjs/Subject';

//export interface IWaitOnResult {
//    //setResult(val: boolean): void;
//    close: (v: boolean) => void;
//}

@Component({
    //moduleId: module.id.toString(),
    selector: 'modal-dialog',
    template: '<ng-content></ng-content>',
    styleUrls: ['./modal-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None // turn off ViewEncapsulation so that we can set html, body, etc., globally
})
export class ModalDialogComponent implements OnInit, OnDestroy {
    @Input() id: string;
    private element: HTMLElement;

    //yesNoResult: Subject<boolean> = new Subject<boolean>();
    private hasClosed: boolean = false;
    constructor(protected modalDialogService: ModalDialogService, protected el: ElementRef) {
        //console.log(`ModalDialogComponent constructor`);
        this.element = el.nativeElement;
    }
    ngOnInit(): void {
        //console.log("ModalDialogComponent: ngOnInit()");
        let modal = this;
        if (!this.id) {
            console.log("modal must have an id");
            return;
        }
        let body = document.getElementsByTagName('body')[0];
        body.appendChild(this.element);
        this.element.addEventListener('click', (e) => {
            let target = <HTMLElement>e.target;
            //let closest = <HTMLElement>target.closest('.modal-dialog-body');
            let closest = <HTMLElement>target.closest('.modal-container');
            if (!closest) {
                //modal.close();
            }
        });
        this.modalDialogService.add(this);
        //console.log(`ModalComponent ngOnInit() finished`);
    }
    ngOnDestroy(): void {
        this.modalDialogService.remove(this.id);
        this.element.remove();
    }
    public open(depth: number) {
        this.element.style.display = "block";
        let overlay = this.getOverlay();// <HTMLElement>document.querySelector(`#${this.id} .modal-overlay`);
        overlay.style.zIndex = (1000 + depth.toString());
        let body = document.querySelectorAll("body");
        if (body !== null) {
            body[0].classList.add('modal-dialog-open');
        }

    }
    public close(): void {
        this.element.style.display = "none";
        let overlay = this.getOverlay();
        overlay.style.zIndex = "0";
        let body = document.querySelectorAll("body");
        if (body !== null) {
            body[0].classList.remove('modal-dialog-open');
        }
        this.hasClosed = true;
    }
    //public onYes() {
    //    this.yesNoResult.next(true);
    //    this.close();
    //}
    //public onNo() {
    //    this.yesNoResult.next(false);
    //    this.close();
    //}
    private getOverlay(): HTMLElement {
        let overlay = <HTMLElement>document.querySelector(`#${this.id} .modal-overlay`);
        if (overlay == null) {
            console.log(`error: modal-dialog id #${this.id} is missing .modal-overlay`);
        }
        return overlay;
    }
}

