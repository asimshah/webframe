
import { Component, ViewChild, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { PopupDialogComponent } from '../../../fastnet/controls/popup-dialog.component';
//import { Page, PageType, EditorService } from './editor.service';
import { TinyMCEComponent, TinyMCEOptions, TinyMCEMenuButtonConfiguration, TinyMCEButtonBaseConfiguration, TinyMCEButtonConfiguration, TinyMCEToolbarButtons, TinyMCEToolbarItem } from '../../../fastnet/tinymce/tinymce.component';
import { PopupMessageComponent, PopupMessageOptions, PopupMessageResult } from '../../../fastnet/controls/popup-message.component';
import { InsertLinkComponent } from './insert-link.component';
import { InsertImageComponent } from './insert-image.component';
import { Page, EditorService, PageType } from '../../shared/editor.service';

@Component({
    selector: 'page-editor',
    templateUrl: './page-editor.component.html',
    styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent  {
    @ViewChild(PopupMessageComponent) private popupMessage: PopupMessageComponent;
    @ViewChild(PopupDialogComponent) private pageEditorDialog: PopupDialogComponent;
    @ViewChild(TinyMCEComponent) editor: TinyMCEComponent;
    @ViewChild(InsertLinkComponent) insertLinkDialog: InsertLinkComponent;
    @ViewChild(InsertImageComponent) insertImageDialog: InsertImageComponent;
    @Output() contentsaved = new EventEmitter<boolean>();
    @Output() pagedeleted = new EventEmitter<boolean>();
    private page: Page;
    text: string;
    hasContentChanged: boolean = false;
    tinymceOptions: TinyMCEOptions;
    private originalHtml: string;
    constructor(private editorService: EditorService, private changeDetector: ChangeDetectorRef) {
        this.tinymceOptions = new TinyMCEOptions();
        this.tinymceOptions.customButtons = this.getEditorToolbarCustomButtons();
        this.tinymceOptions.toolbarButtons = this.getEditorToolbarButtons();
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
            TinyMCEToolbarButtons.Forecolor,
            TinyMCEToolbarButtons.Backcolor,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.Bullist,
            TinyMCEToolbarButtons.Numlist,
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.AlignLeft,
            TinyMCEToolbarButtons.AlignCenter,
            TinyMCEToolbarButtons.AlignRight,
            TinyMCEToolbarButtons.Outdent,
            TinyMCEToolbarButtons.Indent
        ];
        let line2 = [
            TinyMCEToolbarButtons.StyleSelect,
            TinyMCEToolbarButtons.FontSelect,
            TinyMCEToolbarButtons.FontSizeSelect,
            TinyMCEToolbarButtons.Separator,
            "Insertimage",
            "Insertlink",
            TinyMCEToolbarButtons.Separator,
            TinyMCEToolbarButtons.Table,
            TinyMCEToolbarButtons.VisualBlocks,
            TinyMCEToolbarButtons.Code

        ]
        return [line1, line2];
    }
    getEditorToolbarCustomButtons() : TinyMCEButtonBaseConfiguration[] {
        let insertLinkButton = new TinyMCEButtonConfiguration();
        insertLinkButton.name = "insertlink";
        insertLinkButton.tooltip = "Insert an internal or external link"
        insertLinkButton.icon = "link";
        insertLinkButton.onclick = () => this.onInsertLink();
        let insertImageButton = new TinyMCEButtonConfiguration();
        insertImageButton.name = "insertimage";
        insertImageButton.tooltip = "Insert an image"
        insertImageButton.icon = "image";
        insertImageButton.onclick = () => this.onInsertImage();
        return [insertLinkButton, insertImageButton];
    }
    onInsertLink() {
        this.insertLinkDialog.open((url, text) => {
            // not called at all if the user cancelled (in the insert link dialog)
            console.log(`inserting hyperlink`);
            //let content = url.indexOf("image/") === 0 ? `<img src=${url} alt=${text}>` : `<a href=${url}>${text}</a>`;
            let content = `<a href=${url}>${text}</a>`;
            this.editor.focus();
            this.editor.execCommand("mceReplaceContent", content);
        });
    }
    onInsertImage() {
        // not called at all if the user cancelled (in the insert image dialog)
        this.insertImageDialog.open((imageUrl, height, width, linkUrl) => {
            let content = "";
            if (linkUrl) {
                content = `<a href=${linkUrl}><img src=${imageUrl} style="width:${width}px;height: auto" /></a>`;
            } else {
                content = `<img src=${imageUrl} style="width:${width}px;height: auto" />`;
            }
            this.editor.focus();
            this.editor.execCommand("mceReplaceContent", content);
        });
    }
    open(page: Page, innerHtml: string): void {
        //console.log('open');
        this.originalHtml = innerHtml;
        this.hasContentChanged = false;
        this.page = page;
        this.text = innerHtml;
        if (this.text && this.text.trim().length > 0) {
            this.editor.setContent(this.text);
        }
        this.pageEditorDialog.open((r) => {
        });
    }
    onCancel(): void {
        if (this.hasContentChanged === true) {
            let options = new PopupMessageOptions();
            options.allowCancel = true;
            options.warning = true;
            this.popupMessage.open("There are unsaved changes. Press OK if you want to discard these changes.", (r) => {
                if (r === PopupMessageResult.ok) {
                    this.pageEditorDialog.close(false);
                }
            }, options);
        } else {
            this.pageEditorDialog.close(false);
        }
        
    }
    canDelete(): boolean {
        return  this.page && this.page.pageType !== PageType.Centre;
    }
    onContentChange(htmlText: string): void {
        if (this.hasContentChanged === false) {
            this.hasContentChanged = htmlText !== this.originalHtml;
            console.log(`onContentChange: has chnaged = ${this.hasContentChanged}`);
            this.changeDetector.detectChanges();
        }
    }
    async onSave() {
        let htmlText = this.editor.getContent();
        let dr = await this.editorService.updatePageContent(this.page, htmlText);
        this.originalHtml = htmlText;
        this.hasContentChanged = false;
        this.text = this.originalHtml;
        this.popupMessage.open("Changes saved", () => {
            this.contentsaved.emit(true);
        });
    }
    onDelete() {
        let options = new PopupMessageOptions();
        options.allowCancel = true;
        options.warning = true;
        this.popupMessage.open("Deleting a page will remove it permanently. Press OK to proceed", async (r) => {
            if (r === PopupMessageResult.ok) {
                await this.editorService.deletePage(this.page);
                this.pagedeleted.emit(true);
                this.pageEditorDialog.close(false);
            };
        }, options);
    }
    getCaption(): string {
        if (this.page) {
            return `Page Editor: ${this.page.url} (${PageType[this.page.pageType]})`;
        }
        return '';
    }
}
