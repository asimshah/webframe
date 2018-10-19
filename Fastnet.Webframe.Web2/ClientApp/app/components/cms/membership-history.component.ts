import { Component, AfterViewInit } from '@angular/core';
import { CmsService, MemberHistory } from './cms.service';

@Component({
    selector: 'membership-history',
    templateUrl: './membership-history.component.html',
    styleUrls: ['./membership-history.component.scss']
})
export class MembershipHistoryComponent implements AfterViewInit {
    history: MemberHistory[];
    filteredHistory: MemberHistory[];
    searchText: string;
    private isFiltering = false;
    constructor(private cmsService: CmsService) {

    }
    onSearch() {
        if (this.searchText && this.searchText.trim().length > 0) {
            this.isFiltering = true;
            this.filteredHistory = [];
            for (let item of this.history) {
                let st = this.searchText.toLowerCase();
                let r = item.actionName.toLowerCase().includes(st)
                    || item.emailAddress.toLowerCase().includes(st)
                    || item.fullName.toLowerCase().includes(st)
                    || item.actionBy.toLowerCase().includes(st)
                    || item.propertyChanged && item.propertyChanged.toLowerCase().includes(st)
                    || item.oldValue && item.oldValue.toLowerCase().includes(st)
                    || item.newValue && item.newValue.toLowerCase().includes(st)
                    ;
                if (r) {
                    this.filteredHistory.push(item);
                }
            }
        }
    }
    onSearchClear() {
        this.isFiltering = false;
        this.filteredHistory = this.history;
    }
    async ngAfterViewInit() {
        this.history = await this.cmsService.getMembershipHistory();
        this.filteredHistory = this.history;
        console.log("MembershipHistoryComponent");
    }
}

