import { Component, OnInit, ViewChild, } from '@angular/core';
import { BookingAdminService, BookingEmailTemplates, EmailTemplate } from './booking-admin.service';
import { IfStmt } from '@angular/compiler';
import { PopupMessageComponent } from '../../../fastnet/controls/popup-message.component';
import { TinyMCEToolbarButtons, TinyMCEToolbarItem, TinyMCEOptions } from '../../../fastnet/tinymce/tinymce.component';


@Component({
    selector: 'booking-emailtemplates',
    templateUrl: './booking-emailtemplates.component.html',
    styleUrls: ['./booking-emailtemplates.component.scss']
})
export class BookingEmailTemplatesComponent implements OnInit  {
    @ViewChild(PopupMessageComponent) popupMessage: PopupMessageComponent;
    templateList: string[] = [];
    selectedTemplate: string;
    templateType: BookingEmailTemplates;
    currentTemplate: EmailTemplate;
    tinymceOptions: TinyMCEOptions;
    constructor(private adminService: BookingAdminService) {
        this.tinymceOptions = new TinyMCEOptions();
        this.tinymceOptions.toolbarButtons = this.getEditorToolbarButtons();
    }
    async ngOnInit() {
        await this.loadTemplateList();
    }
    async onCancel() {
        this.loadTemplate();
    }
    async onSave() {
        await this.adminService.saveEmailTemplate(this.currentTemplate);
        this.popupMessage.open("Email template saved", () => { });
    }
    async onTemplateChanged() {
        this.convertTemplateString();
        await this.loadTemplate();
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
    }
}
