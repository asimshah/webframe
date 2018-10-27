import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnDestroy, EventEmitter, Output, ViewEncapsulation, OnChanges, SimpleChange, SimpleChanges, DoCheck } from '@angular/core';

import 'tinymce';
import 'tinymce/themes/modern';

import 'tinymce/plugins/table';
import 'tinymce/plugins/link';
import { Editor } from 'tinymce';

declare var tinymce: any;// EditorManager;
export type TinyMCEToolbarItem = TinyMCEToolbarButtons | string;
export enum TinyMCEToolbarButtons {
    Separator,
    Undo,
    Redo,
    Cut,
    Copy,
    Paste,
    Bold,
    Italic,
    Forecolor,
    Backcolor,
    Bullist,
    Numlist,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Outdent,
    Indent,
    StyleSelect,
    FontSelect,
    FontSizeSelect,
    Table,
    VisualBlocks,
    Code
}
export class TinyMCEMenuItem {
    text: string;
    onclick: () => void;
}
export class TinyMCEButtonBaseConfiguration {
    name: string; // a name such as 'insertlinks' - this name can then be used on when creating the toolbar
    type: 'splitbutton' | 'menubutton' | 'listbox' | undefined;
    text: string;
    icon: string;
    image: string;
    tooltip: string;

}
export class TinyMCEButtonConfiguration extends TinyMCEButtonBaseConfiguration {
    onclick: () => void;
    constructor() {
        super();
    }
}
export class TinyMCEMenuButtonConfiguration extends TinyMCEButtonBaseConfiguration {
    //title: string;
    menus: TinyMCEMenuItem[] = [];
    constructor() {
        super();
        this.type = "menubutton";
    }
}
export class TinyMCESplitButtonConfiguration extends TinyMCEButtonBaseConfiguration {
    menu: TinyMCEMenuItem[] = [];
    onclick: () => void;
    constructor() {
        super();
        this.type = "menubutton";
    }
}

export class TinyMCEOptions {
    customButtons: TinyMCEButtonBaseConfiguration[] = [];
    toolbarButtons: TinyMCEToolbarItem[][];
}

@Component({
    selector: 'tiny-mce',
    templateUrl: './tinymce.component.html',
    styleUrls: ['./tinymce.component.scss']//,
    //encapsulation: ViewEncapsulation.None
})
export class TinyMCEComponent implements AfterViewInit, OnDestroy {
    @ViewChild('mcetarget') mceTarget: ElementRef;
    @Input() height: number = 300;
    //@Input() content: string;
    @Input() options: TinyMCEOptions;
    @Output() contentchange = new EventEmitter<string>();
    private editor: Editor;
    ngAfterViewInit() {
        console.log('ngAfterViewInit()');
        tinymce.baseURL = "/tinymce";
        tinymce.init({
            target: this.mceTarget.nativeElement,
            height: this.height,// 500,
            statusbar: false,
            skin_url: '/skins/lightgray',
            theme: 'modern',
            plugins: "textcolor colorpicker visualblocks table link image code lists",
            menubar: false,
            browser_spellcheck: true,
            toolbar_items_size: 'small',
            //toolbar: ["undo redo | cut copy paste | bold italic forecolor backcolor | bullist numlist | alignleft aligncenter alignright outdent indent", "styleselect | fontselect fontsizeselect insertlinks | table visualblocks code ",
            //],
            toolbar: this.loadToolbarButtons(this.options),
            relative_urls: false,
            remove_script_host: true,
            document_base_url: "/",
            setup: (editor: Editor) => {
                this.editor = editor;
                if (this.options) {
                    if (this.options.customButtons) {
                        for (let button of this.options.customButtons) {
                            switch (button.type) {
                                default:
                                    this.addButton(editor, button as TinyMCEButtonConfiguration);
                                    break;
                                case 'splitbutton':
                                case 'listbox':
                                    break;
                                case 'menubutton':
                                    this.addMenuButton(editor, button as TinyMCEMenuButtonConfiguration);
                                    break;
                            }
                        }
                    }
                    editor.on('keyup', () => {
                        console.log(`keyup:`);
                        let x = this.editor.getContent();
                        this.contentchange.emit(x);
                    });
                    editor.on('change', () => {
                        console.log(`change:`);
                        let x = this.editor.getContent();
                        this.contentchange.emit(x);
                    });
                    //editor.on('init', () => {
                    //    //console.log(`init: `);
                    //    if (this.content) {
                    //        console.log(`init setting: ${this.content}`);
                    //        this.editor.setContent(this.content);
                    //    }
                    //});
                }
            }
        });
    }
    ngOnDestroy() {
        if (this.editor) {
            this.editor.remove();
        }
    }
    //ngDoCheck(): void {
    //    console.log("Docheck()");
    //}
    getContent(): string {
        return this.editor.getContent();
    }
    setContent(content: string): string {
        return this.editor.setContent(content);
    }
    focus() {
        if (this.editor) {
            this.editor.focus(true);
        }
    }
    execCommand(cmd: string, value: any) {
        if (this.editor) {
            this.editor.execCommand(cmd, false, value);
        }
    }
    private dummy(descr: string) {
        console.log(`dummy: ${descr}`);
    }
    private addMenuButton(editor: Editor, config: TinyMCEMenuButtonConfiguration) {
        let buttonConfig = {
            type: 'menubutton',
            text: config.text,
            icon: config.icon,
            image: config.image,
            tooltip: config.tooltip,
            menu: config.menus
        };
        editor.addButton(config.name, buttonConfig);
    }
    private addButton(editor: Editor, config: TinyMCEButtonConfiguration) {
        let buttonConfig = {
            text: config.text,
            icon: config.icon,
            image: config.image,
            tooltip: config.tooltip,
            onclick: () => config.onclick()
        };
        editor.addButton(config.name, buttonConfig);
    }
    private loadToolbarButtons(options: TinyMCEOptions): string[] {
        let toolbarButtons: TinyMCEToolbarItem[][] = [
            [
                TinyMCEToolbarButtons.Cut,
                TinyMCEToolbarButtons.Copy,
                TinyMCEToolbarButtons.Paste,
                TinyMCEToolbarButtons.Separator,
                TinyMCEToolbarButtons.Bold,
                TinyMCEToolbarButtons.Italic,
            ]
        ];
        if (options && options.toolbarButtons) {
            toolbarButtons = options.toolbarButtons;
        }
        let buttons: string[] = [];
        for (let item of toolbarButtons) {
            buttons.push(this.convertToolbarButtonsToString(item))
        }
        return buttons;
    }
    private convertToolbarButtonsToString(buttons: TinyMCEToolbarItem[]): string {
        let result: string[] = [];
        for (let b of buttons) {
            if (typeof b === "string") {
                result.push(b.toLowerCase());
            } else {
                if (b === TinyMCEToolbarButtons.Separator) {
                    result.push("|");
                } else {
                    result.push(TinyMCEToolbarButtons[b].toLowerCase());
                }
            }
        }
        return result.join(" ");
    }
}
