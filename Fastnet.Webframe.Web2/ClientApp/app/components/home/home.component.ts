import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
    ngOnInit() {
        if ( document !== undefined) {
            let headElement: HTMLHeadElement = document.getElementsByTagName("head")[0];
            let customLink = document.createElement("link");
            customLink.rel = "stylesheet";
            customLink.href = "/css/custom.css";
            headElement.appendChild(customLink);
        }
    }
}
