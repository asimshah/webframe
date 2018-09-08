import { NgModule } from "@angular/core";
import { GroupTreeComponent } from "./group-tree.component";
import { ControlsModule } from "../../fastnet/controls/controls.module";
//import { ControlsModule } from "../controls/controls.module";
//import { TreeModule } from "angular-tree-component";

@NgModule({
    imports: [
        ControlsModule
    ],
    exports: [
        GroupTreeComponent
    ],
    declarations: [
        GroupTreeComponent
    ],
})
export class MembershipSharedModule { }