import { Component, ElementRef, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { ModalDialogService } from './modal-dialog.service';

//interface Window {
//    Element: any;
//}

//declare global {
//    interface Window {
//        Element: any;
//    }
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
    constructor(private modalDialogService: ModalDialogService, private el: ElementRef) {
        //console.log(`ModalDialogComponent constructor`);
        this.element = el.nativeElement;
    }
    ngOnInit(): void {
        //console.log(`ModalComponent ngOnInit() started`);

        //if (window.Element && !Element.prototype.closest) {
        //    Element.prototype.closest = function (s) {
        //        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        //            i,
        //            el = this;
        //        do {
        //            i = matches.length;
        //            while (--i >= 0 && matches.item(i) !== el) { };
        //        } while ((i < 0) && (el = el.parentElement));
        //        return el;
        //    };
        //}
        console.log("ModalDialogComponent: ngOnInit()");
        let modal = this;
        if (!this.id) {
            console.error("modal must have an id");
            return;
        }
        let body = document.getElementsByTagName('body')[0];
        body.appendChild(this.element);
        this.element.addEventListener('click', (e) => {
            let target = <HTMLElement>e.target;
            let closest = <HTMLElement>target.closest('.modal-dialog-body');
            if (!closest) {
                modal.close();
            }
        });
        this.modalDialogService.add(this);
        //console.log(`ModalComponent ngOnInit() finished`);
    }
    ngOnDestroy(): void {
        this.modalDialogService.remove(this.id);
        this.element.remove();
    }
    public open(): void {
        this.element.style.display = "block";
        let body = document.querySelectorAll("body");
        if (body !== null) {
            body[0].classList.add('modal-dialog-open');
        }
        //window.document.querySelector("body").classList.add('modal-dialog-open');
    }
    public close(): void {
        this.element.style.display = "none";        
        let body = document.querySelectorAll("body");
        if (body !== null) {
            body[0].classList.remove('modal-dialog-open');
        }
        //document.querySelector("body").classList.remove('modal-dialog-open');
    }
}

