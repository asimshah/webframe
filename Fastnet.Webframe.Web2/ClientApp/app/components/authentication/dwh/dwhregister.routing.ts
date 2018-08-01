import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DwhRegisterComponent } from './dwhregister.component';



const routes: Routes = [
    { path: '', component: DwhRegisterComponent }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);