import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, Routes, Route } from '@angular/router';

import { ModalDialogService } from '../modaldialog/modal-dialog.service';
//import { ConfigService } from '../shared/config.service';
import { ClientCustomisation, FactoryName, RouteRedirection} from '../shared/config.types'
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfigService } from '../shared/config.service';
declare var getCustomisation: any;
//declare var platform: any;

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['../../../../node_modules/angular-tree-component/dist/angular-tree-component.css', '../../styles/webframe.scss', './app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
    private customisation: ClientCustomisation;
    constructor(private router: Router,
        private configService: ConfigService,
        private authenticationService: AuthenticationService,
        private dialogService: ModalDialogService) {
        this.customisation = <ClientCustomisation>getCustomisation();
        console.log(`AppComponent constructor(): for factory ${FactoryName[this.customisation.factory]}`);
        this.loadCustomCss();
        for (let rr of this.customisation.routeRedirections) {
            this.redirect(rr.fromRoute, rr.toRoute);
        }
    }
    async ngOnInit() {
        console.log(`AppComponent constructor(): ngOnInit`);
        await this.configService.postCi();
        //await this.authenticationService.sync();
    }
    private loadCustomCss() {
        // I can't load this css in the normal way using a link tag in the
        // _Layout.cshtml because all the remain styles are created as <style> elements by the angular environment
        // and added **after the end of the <head> containing element**
        // this means that these created styles take precedence over the custom.css which then
        // means that custom.css rules are overridden by the webframe rules built into the app
        // which is the reverse of what I require.
        // so I load it here at run time and put it in the right place (after all the other rules)
        try {
            let headElement: HTMLHeadElement = document.getElementsByTagName("head")[0];
            let customLink = document.createElement("link");
            customLink.rel = "stylesheet";
            customLink.href = "/css/custom.css";
            headElement.appendChild(customLink);
        } catch (e) {
            console.log("custom css not loaded")
        }
    }

    private redirect(fromRoute: string, toRoute: string) {
        let fromIndex = this.router.config.findIndex((r) => r.path == fromRoute);
        let toIndex = this.router.config.findIndex((r) => r.path == toRoute);
        if (fromIndex > 0 && toIndex > 0) {
            //this.router.config[fromIndex].loadChildren = this.router.config[toIndex].loadChildren;
            let tr = this.router.config[toIndex];
            let fr = this.router.config[fromIndex];
            tr.path = fromRoute;
            fr.path = toRoute;
            this.router.config[fromIndex] = tr;
            this.router.config[toIndex] = fr;
            console.log(`route ${fromRoute} redirected to ${toRoute}`);
            //console.log(`membership route index is ${fromIndex}, ${this.router.config[fromIndex].loadChildren}`);
        } else {
            console.log(`route redirection failed: fromIndex = ${fromIndex}, toIndex ${toIndex}`);
        }
    }
}
