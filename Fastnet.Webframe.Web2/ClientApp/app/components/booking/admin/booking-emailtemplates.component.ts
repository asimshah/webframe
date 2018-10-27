import { Component, OnInit, ViewChild, AfterViewInit, ContentChild, AfterContentInit, } from '@angular/core';
import { BookingAdminService, BookingEmailTemplates, EmailTemplate } from './booking-admin.service';
import { IfStmt } from '@angular/compiler';
import { PopupMessageComponent } from '../../../fastnet/controls/popup-message.component';
import { TinyMCEToolbarButtons, TinyMCEToolbarItem, TinyMCEOptions, TinyMCEComponent } from '../../../fastnet/tinymce/tinymce.component';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';


@Component({
    selector: 'booking-emailtemplates',
    templateUrl: './booking-emailtemplates.component.html',
    styleUrls: ['./booking-emailtemplates.component.scss']
})
export class BookingEmailTemplatesComponent implements AfterViewInit {
    @ViewChild(PopupDialogComponent) keywordsPopup: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    @ViewChild(TinyMCEComponent) editor: TinyMCEComponent;
    templateList: string[] = [];
    selectedTemplate: string;
    templateType: BookingEmailTemplates;
    currentTemplate: EmailTemplate;
    tinymceOptions: TinyMCEOptions;
    constructor(private adminService: BookingAdminService) {
        this.tinymceOptions = new TinyMCEOptions();
        this.tinymceOptions.toolbarButtons = this.getEditorToolbarButtons();
    }
    async ngAfterViewInit() {
        await this.loadTemplateList();
    }

    async onCancel() {
        this.loadTemplate();
    }
    async onSave() {
        this.currentTemplate.body = this.editor.getContent();
        await this.adminService.saveEmailTemplate(this.currentTemplate);
        this.popupMessage.open("Email template saved", () => { });
    }
    async onTemplateChanged() {
        console.log("onTemplateChanged");
        this.convertTemplateString();
        await this.loadTemplate();
    }
    showKeywordsPopup() {
        this.keywordsPopup.open(() => { });
    }
    onCloseKeywordsPopup() {
        this.keywordsPopup.close();
    }
    getEditorToolbarButtons(): TinyMCEToolbarItem[][] {
        let line1 = [
            TinyMCEToolbarButtons.Undo,
            TinyMCEToolbarButtons.Redo,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.Cut,
            TinyMCEToolbarButtons.Copy,
            TinyMCEToolbarButtons.Paste,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.Bold,
            TinyMCEToolbarButtons.Italic,
            //TinyMCEToolbarButtons.Forecolor,
            //TinyMCEToolbarButtons.Backcolor,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.Bullist,
            TinyMCEToolbarButtons.Numlist,
            TinyMCEToolbarButtons.Separator,
            //TinyMCEToolbarButtons.AlignLeft,
            //TinyMCEToolbarButtons.AlignCenter,
            //TinyMCEToolbarButtons.AlignRight,
            //TinyMCEToolbarButtons.Outdent,
            //TinyMCEToolbarButtons.Indent
            TinyMCEToolbarButtons.StyleSelect,
            TinyMCEToolbarButtons.FontSelect,
            TinyMCEToolbarButtons.FontSizeSelect,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.VisualBlocks,
            TinyMCEToolbarButtons.Code
        ];
        //let line2 = [
        //    TinyMCEToolbarButtons.StyleSelect,
        //    TinyMCEToolbarButtons.FontSelect,
        //    TinyMCEToolbarButtons.FontSizeSelect,
        //    TinyMCEToolbarButtons.Separator,
        //    "Insertimage",
        //    "Insertlink",
        //    TinyMCEToolbarButtons.Separator,
        //    TinyMCEToolbarButtons.Table,
        //    TinyMCEToolbarButtons.VisualBlocks,
        //    TinyMCEToolbarButtons.Code

        //]
        return [line1];
    }
    private async loadTemplateList() {
        this.templateList = await this.adminService.getEmailTemplateList();
    }
    private convertTemplateString() {
        this.templateType = (<any>BookingEmailTemplates)[this.selectedTemplate];
    }
    private async loadTemplate() {
        this.currentTemplate = await this.adminService.getEmailTemplate(this.templateType);
        this.editor.setContent(this.currentTemplate.body);
    }
}
