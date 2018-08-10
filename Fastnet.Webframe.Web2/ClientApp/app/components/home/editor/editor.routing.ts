import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditorComponent } from './editor.component';




const routes: Routes = [
    { path: '', component: EditorComponent }
];

export const editorRouting: ModuleWithProviders = RouterModule.forChild(routes);