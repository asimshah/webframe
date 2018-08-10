
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'webframe-logout',
    template: ''
})
export class LogoutComponent implements OnInit {
    constructor(private authenticationService: AuthenticationService, private router: Router) {

    }
    async ngOnInit() {
        await this.authenticationService.logout();
        this.router.navigate(['home']); // we need this to ensure that the logout has completed
    }

}
