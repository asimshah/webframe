
import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { PageComponent } from '../../page/page.component';
import { PageEditorComponent } from './page-editor.component';
import { PageService } from '../../shared/page.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorService, Page, PageType, NewPage } from './editor.service';
import { PopupMessageComponent, PopupMessageOptions } from '../../../fastnet/controls/popup-message.component';

@Component({
    selector: 'editable-page',
    templateUrl: './editable-page.component.html',
    styleUrls: ['./editable-page.component.scss']
})
export class EditablePageComponent extends PageComponent {
    @ViewChild(PageEditorComponent) pageEditor: PageEditorComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @Input() pagetype: PageType;
    @Input() editable: boolean;
    @Input() centrePageId?: number;
    @Output() contentsaved = new EventEmitter<boolean>();
    @Output() sidecontentchanged = new EventEmitter<boolean>();
    page: Page;
    innerHtml: string;
    rawHtml: string;
    constructor(pageService: PageService, sanitizer: DomSanitizer, private editorService: EditorService) {
        super(pageService, sanitizer);
        console.log(`EditablePageComponent() `);
    }
    onOverlayClick() {
        this.pageEditor.open(this.page, this.rawHtml);
        
    }
    canAddContent(): boolean {
        return this.page && this.page.pageType !== PageType.Centre && this.editable === false;
    }
    hasContent(): boolean {
        if (this.innerHtml) {            
            return this.rawHtml.trim().length > 0;
        }
        return false;
    }
    async onAddContentClick(e: MouseEvent) {
        e.stopPropagation();
        let np = new NewPage();
        np.referencePageId = this.centrePageId;
        np.type = this.pagetype;
        np.name = `${PageType[this.pagetype]} Page`;
        let sr = await this.editorService.createPage(np);
        if (sr.success) {
            this.sidecontentchanged.emit(true);
            //this.pageId = <number>sr.data;
            //await this.loadPage();
        } else {
            let options = new PopupMessageOptions();
            options.error = true;
            this.popupMessage.open(sr.errors, () => { });
        }
        //console.log(`add a ${PageType[this.pagetype]} page here`);
    }
    async onContentSaved(val: boolean) {
        await this.loadPage();
        this.contentsaved.emit(true);
    }
    onPageDeleted() {
        this.sidecontentchanged.emit(true);
    }
    async loadPage() {
        this.page = await this.editorService.getPage(this.pageId!);
        let r = await this.pageService.getPageHtml(<number>this.pageId);
        if (r !== null) {
            this.rawHtml = r.htmlText;
            this.innerHtml = <string>this.sanitizer.bypassSecurityTrustHtml(r.htmlText);
        }
    }
}
