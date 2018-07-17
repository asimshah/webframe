
import { Component, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, OnDestroy, Type, ComponentRef } from '@angular/core';
import { MembershipComponent } from './membership.component';
import { ClientCustomisation, FactoryName } from '../shared/config.types';
import { DwhMembershipComponent } from './dwh/dwhmembership.component';
declare var getCustomisation: any;

@Component({
    selector: 'membership-ph',
    templateUrl: './membership-placeholder.component.html'
})
export class MembershipPlaceholderComponent implements OnInit, OnDestroy {
    private customisation: ClientCustomisation;
    private membershipComponent: MembershipComponent;
    private componentRef: any = null;
    @ViewChild('membershipComponent', { read: ViewContainerRef }) componentContainer: ViewContainerRef;
    constructor(private componentResolver: ComponentFactoryResolver) {
        console.log(`MembershipPlaceholderComponent: constructor()`);
        this.customisation = <ClientCustomisation>getCustomisation();
    }
    ngOnInit(): void {
        switch (this.customisation.factory) {
            case FactoryName.DonWhillansHut:
                this.loadMembershipComponent(DwhMembershipComponent);
                break;
            default:
                this.loadMembershipComponent(MembershipComponent);
                break;
        }
    }

    ngOnDestroy(): void {
        if (this.componentRef !== null) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }
    private loadMembershipComponent<T extends MembershipComponent>(component: Type<T>) {
        this.componentContainer.clear();
        let cf = this.componentResolver.resolveComponentFactory<T>(component);
        this.componentRef = this.componentContainer.createComponent(cf);
        this.membershipComponent = this.componentRef.instance;
    }
}
