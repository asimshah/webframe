import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MailItem, CmsService } from './cms.service';
import { PopupDialogComponent } from '../../fastnet/controls/popup-dialog.component';
import { DomSanitizer, SafeStyle, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'mail-history',
    templateUrl: './mail-history.component.html',
    styleUrls: ['./mail-history.component.scss']
})
export class MailHistoryComponent implements AfterViewInit {
    @ViewChild('mailbody') mailBodyPopup: PopupDialogComponent;
    history: MailItem[];
    filteredHistory: MailItem[];
    searchText: string;
    mailBody: SafeHtml;
    mailBodyCaption: string;
    private isFiltering = false;
    constructor(private cmsService: CmsService, private sanitizer: DomSanitizer) {

    }
    async ngAfterViewInit() {
        this.history = await this.cmsService.getMailHistory();
        this.filteredHistory = this.history;
    }
    onSearch() {
        if (this.searchText && this.searchText.trim().length > 0) {
            this.isFiltering = true;
            this.filteredHistory = [];
            for (let item of this.history) {
                let st = this.searchText.toLowerCase();
                let r = item.to.toLowerCase().includes(st)
                    || item.subject.toLowerCase().includes(st)
                    || item.combinedDescription.toLowerCase().includes(st)
                    || item.mailTemplate.toLowerCase().includes(st);
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
    async showBody(m: MailItem) {
        let body = await this.cmsService.getMailBody(m);
        this.mailBody = this.sanitizer.bypassSecurityTrustHtml(body);
        this.mailBodyCaption = `Mail Sent to ${m.to}, ${m.recordedOn}`;
        this.mailBodyPopup.open(() => { });
    }
    onCloseMailBody() {
        this.mailBodyPopup.close();
    }
}

