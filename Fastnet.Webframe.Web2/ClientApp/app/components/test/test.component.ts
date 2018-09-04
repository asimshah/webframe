
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Validator, ControlState, ValidationResult, ValidationContext, ListItem } from '../controls/controls.types';
import { isNullorUndefined, isWhitespaceOrEmpty, toEnumValues} from '../controls/controlbase2.type';
import { InlineDialogComponent } from '../controls/inline-dialog.component';
import { TextInputControl } from '../controls/text-input.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Resizability } from '../controls/multiline-input.component';
import {  DayStatus, CalendarDay, DaysOfTheWeek } from '../controls/date-input.component';
import { PopupDialogComponent } from '../controls/popup-dialog.component';
import { PopupMessageComponent, PopupMessageOptions } from '../controls/popup-message.component';
//import { TextInputControl2 } from '../controls/text-input-new.component';

enum testEnum {
    Red = 8,
    White,
    Blue,
    Green
}
class test {
    firstName: string;
    lastName: string;
    something: string = "something...";
    emailAddress1: string;
    emailAddress2: string;
    bool1: boolean;
    bool2: boolean;
    bool3: boolean;
    bool4: boolean;
    enum1: testEnum = testEnum.Green;
    enum2: testEnum = testEnum.Red;
    password1: string;
    password2: string;
    number1: number;
    number2: number;
    multi1: string;
    multi2: string;
    dropItem1: ListItem<any>;
    dropItem2: ListItem<any>;
    dropItem3: ListItem<any>;
    date1: Date;
    date2: Date;
    date3: Date;
    combo1: ListItem<any>;
    combo2: ListItem<any>;
}

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements AfterViewInit {
    testEnum = testEnum;
    Resizability = Resizability;
    @ViewChild('ctldialog') testDialog: InlineDialogComponent;
    @ViewChild('ctllastname') lastNameInput: TextInputControl;
    @ViewChild('popupone') popupone: PopupDialogComponent;
    @ViewChild('popuptwo') popuptwo: PopupDialogComponent;
    @ViewChild(PopupMessageComponent) messagePopup : PopupMessageComponent;
    model: test = new test();
    colourNames = ["Bright Red", "Pure White", "Azure", "Sea Green"];
    boolNames = ["White", "Black"];
    dropset1: ListItem<any>[];
    dropset2: ListItem<any>[];
    constructor(private sanitizer: DomSanitizer) {
        console.log("constructor()");
        this.test();
        this.dropset1 = this.buildYearListItems();// this.buildListItems(["alpha", "beta", "gamma"]);
        this.model.dropItem1  = this.dropset1[1];
        let set2Names: string[] = [];
        for (let i = 0; i < 25; ++i) {
            set2Names.push(`set2-item-${i}`);
        }
        this.dropset2 = this.buildListItems(set2Names);
        this.model.combo1 = this.dropset2[3];
        this.model.combo2 = this.dropset1[3];
    }
    test() {
        toEnumValues(testEnum);
    }
    ngAfterViewInit() {
        //this.lastNameInput.focus();
    }
    async onValidateAllClick() {
        let result = await this.testDialog.isValid();
        console.log(`testdialog isValid() returned ${result}`);
    }
    onDrop1Change(item: ListItem<any>) {
        console.log(`Drop 1 changed to ${JSON.stringify(item, null, 2)}`);
    }
    onDrop3Changed(item: ListItem<any>) {
        console.log(`Drop 3 changed to ${JSON.stringify(item, null, 2)}`);
    }
    fontAwesomeLabel(label: string, faIcon: string = "fa-blank", iconColour: string = "transparent") {        
        let l = `<span class='fa ${faIcon}' style='color: ${iconColour}'></span><span><span>${label}</span>`;
        return this.sanitizer.bypassSecurityTrustHtml(l);
    }
    async validateFirstName(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log('validateFirstName called');
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = "a First Name is required";
            } else {
                let t = value as string;
                if (t.length < 4) {
                    vr.valid = false;
                    vr.message = "a First Name minimum length is 4";
                }
            }
            resolve(vr);
        });
    }
    async validateLastName(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log('validateLastName called');
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value) || isWhitespaceOrEmpty(value)) {
                vr.valid = false;
                vr.message = "a Last Name is required";
            } else {
                let t = value as string;
                if (t.length < 8) {
                    vr.valid = false;
                    vr.message = "a Last Name minimum length is 8";
                }
            }
            if (context === ValidationContext.LostFocus) {
                console.log("validateLastName: lostfocus - can call back end here");
            }
            resolve(vr);
        });
    }
    async validateEmailAddress(context: ValidationContext, value: any): Promise<ValidationResult> {
        return new Promise<ValidationResult>(resolve => {
            let vr = new ValidationResult();
            resolve(vr);
        });
    }
    buildListItems(names: string[]): ListItem<any>[] {
        let r: ListItem<any>[] = [];
        let index = 1;
        for (let name of names) {
            r.push({ name: name, value: index * index })
            ++index;
        }
        return r;
    }
    onShowingDay(cd: CalendarDay) {
        switch (cd.dayOfWeek) {
            case DaysOfTheWeek.Saturday:
            case DaysOfTheWeek.Sunday:
                cd.status.classes.push("is-weekend");
                break;
            default:
                break;
        }
    }
    buildYearListItems(): ListItem<any>[] {
        let r: ListItem<any>[] = [];

        for (let i = 1900; i < 2025;++i) {
            r.push({ name: i.toString(), value: i })
        }
        return r;
    }
    onNormalMessage() {
        this.messagePopup.open("this is a normal message", (r) => {
            console.log(`normal message closed with result = ${r}`);
        });
    }
    onOptionsMessage() {
        let options = new PopupMessageOptions();
        options.width = 370;
        options.warning = true;
        options.allowCancel = true;
        options.caption = "frerdfred";
        this.messagePopup.open(
            ["1. this is a message with options", "<i>2. it is also multi line</i>"],
            (r) => {
                console.log(`options message closed with result = ${r}`);
            },
            options);
    }
    onPopupOne() {
        this.popupone.open((a) => this.popupClosed(a));
    }
    onPopupTwo() {
        this.popuptwo.open((a) => this.popupClosed(a));
    }
    onClosePopupOne() {
        this.popupone.close("popup one closed");
    }
    onClosePopupTwo() {
        this.popuptwo.close("popup two closed");
    }
    popupClosed(arg: string): void {
        console.log(arg);
    }
}
