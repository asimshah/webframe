import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
//import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
//import { MembershipComponent } from './components/membership/membership.component';
//import { BookingComponent } from './components/booking/booking.component';
//import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
//import { CounterComponent } from './components/counter/counter.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule' },
            { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule' },
            { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule' },
            { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule' },
            { path: '**', redirectTo: 'home' }
        ], { enableTracing: true})
    ]
})
export class AppModuleShared {
}
