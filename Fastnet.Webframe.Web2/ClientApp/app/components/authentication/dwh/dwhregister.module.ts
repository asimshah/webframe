import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageModule } from '../../page/page.module';
import { routing } from './dwhregister.routing';
import { DwhRegisterComponent } from './dwhregister.component';
import { ControlsModule } from '../../../fastnet/controls/controls.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        routing,
        PageModule,
        ControlsModule
    ],
    exports: [],
    declarations: [
        DwhRegisterComponent
    ],
    providers: [],
})
export class DwhRegisterModule { }