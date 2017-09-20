import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeComponent } from './components/home/home.component';
//import { MemberGuard } from './components/routeguards/member.guard';
import { PermissionDeniedComponent } from './components/routeguards/permissiondenied.component';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        PermissionDeniedComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        AppRoutingModule
        //RouterModule.forRoot([
        //    { path: '', redirectTo: 'home', pathMatch: 'full' },
        //    { path: 'home', component: HomeComponent },
        //    { path: 'membership', loadChildren: './components/membership/membership.module#MembershipModule' },
        //    { path: 'booking', loadChildren: './components/booking/booking.module#BookingModule' },
        //    { path: 'cms', loadChildren: './components/cms/cms.module#CmsModule' },
        //    { path: 'designer', loadChildren: './components/designer/designer.module#DesignerModule' },
        //    //{ path: 'permissiondenied', component: PermissionComponent},
        //    { path: '**', redirectTo: 'home' }
        //], { enableTracing: true })
    ],
    providers: [
        //appRoutingProviders,
       // MemberGuard
    ]
})


export class AppModuleShared {
}
