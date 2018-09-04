import { Component, QueryList, ContentChildren, AfterContentInit, OnDestroy, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ControlBase2 } from './controlbase2.type';

const popupZindexBase = 5000;
@Component({
    selector: 'popup-dialog',
    templateUrl: './popup-dialog.component.html',
    styleUrls: ['./popup-dialog.component.scss']
})
export class PopupDialogComponent implements OnInit, AfterContentInit, OnDestroy {
    public static openPopupsCount = 0;
    private static counter = 0;
    @ContentChildren(ControlBase2) controls: QueryList<ControlBase2>;
    @ViewChild('overlay') overlay: ElementRef;
    protected popupComponentElement: HTMLElement;
    private reference: string;
    private isInitialised: boolean = false;
    constructor(pdc: ElementRef) {
        
        this.popupComponentElement = pdc.nativeElement;
    }
    ngOnInit(): void {
        if (this.isInitialised === false) {
            this.reference = `pdc-${PopupDialogComponent.counter++}`;
            
            this.popupComponentElement.style.display = "none";
            document.body.appendChild(this.popupComponentElement);// move myself to the body
            console.log(`ngOnInit():moved  ${this.reference} to body`);
            this.isInitialised = true;
        }
    }
    ngAfterContentInit(): void {
        console.log(`${this.reference}, controls now ${this.controls.length}`);
    }

    ngOnDestroy(): void {
        console.log(`ngOnDestroy(): ${this.reference}`);
    }
    public open() {
        let zIndex = popupZindexBase + (1000 * PopupDialogComponent.openPopupsCount++);
        let overlay = this.overlay.nativeElement as HTMLDivElement;
        overlay.style.zIndex = zIndex.toString();
        this.popupComponentElement.style.display = "block";
    }
    public close() {
        this.popupComponentElement.style.display = "none";
        let overlay = this.overlay.nativeElement as HTMLDivElement;
        overlay.style.zIndex = "0";
        PopupDialogComponent.openPopupsCount--;
    }
}
