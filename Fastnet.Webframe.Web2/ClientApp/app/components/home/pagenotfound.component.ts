import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'page-not-found',
    templateUrl: './pagenotfound.component.html',
    styleUrls: ['./pagenotfound.component.scss']
})
export class PageNotFoundComponent {
    constructor(private router: Router) {

    }
    onGoback(): void {
        this.router.navigate(['home']);
    }
}