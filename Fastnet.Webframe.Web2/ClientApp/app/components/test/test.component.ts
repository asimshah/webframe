import { Component,  AfterViewInit } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements AfterViewInit {
    constructor(private sanitizer: DomSanitizer) {
        console.log("constructor()");
    }

    ngAfterViewInit() {
        //this.lastNameInput.focus();
    }

}
