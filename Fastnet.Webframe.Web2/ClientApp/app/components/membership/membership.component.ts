import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageService } from '../shared/page.service';
import { ValidationResult, ControlState, EnumValue} from '../controls/controls.component';

class TabItem {
    name: string;
    selected: boolean;
    constructor(name: string) {
        this.name = name;
        this.selected = false;
    }
}
enum Choice {
    First,
    Second,
    Third
}
class memberProperties {
    firstName: string;
    lastName: string;
    something: string;
    disabled: boolean;
    choice: Choice;
    constructor() {
        this.firstName = "";
        this.something = this.lastName = this.firstName;
        this.disabled = false;
        this.choice = Choice.First;
    }
}


@Component({
    selector: 'webframe-membership',
    templateUrl: './membership.component.html',
    styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit {
    //public numbers: number[] = [];
    public choiceValues: EnumValue[] = [];
    public groupMode: boolean; 
    public bannerPageId: number | null;
    public tabs: TabItem[] = [];
    public searchText: string = "";
    public member: memberProperties;
    //public memberValidations: { [key: string]: ValidationResult } = {};
    public mValidations: Map<string, ValidationResult> = new Map<string, ValidationResult>();
    private fnv: boolean;
    get firstNameValid(): boolean {
        return this.fnv;
    }
    set firstNameValid(v: boolean) {
        this.fnv = v;
    }
    constructor(protected pageService: PageService, protected router: Router) {
        this.member = new memberProperties();
        //this.memberValidations["firstName"] = new ValidationResult();
        //this.memberValidations["lastName"] = new ValidationResult();
        //this.memberValidations["something"] = new ValidationResult();
        this.mValidations.set("firstName", new ValidationResult());
        this.mValidations.set("lastName", new ValidationResult());
        this.mValidations.set("something", new ValidationResult());
        this.choiceValues = this.choiceToValues();
    }
    async ngOnInit() {

        this.bannerPageId = await this.pageService.getDefaultBanner();
        let letters = [
            "A", "B", "C", "D", "E", "F", "G", "H",
            "I", "J", "K", "L", "M", "N", "O", "P",
            "Q", "R", "S", "T", "U", "V", "W", "X",
            "Y", "Z", "#"
        ]
        for (let letter of letters) {
            let ti = new TabItem (letter);
            this.tabs.push(ti);
        }

    }
    goBack() {
        this.router.navigate(['/home']);
    }
    getPageId() {
        return this.bannerPageId;
    }
    setMode(group: boolean) {
        if (group) {
            if (!this.groupMode) {
                this.groupMode = true;
            }
        } else {
            if (this.groupMode) {
                this.groupMode = false;
            }
        }
    }
    selectTab(item: TabItem) {
        console.log(`pressed ${item.name}`);
        this.searchText = item.name;
        this.clearTabSelection();
        item.selected = true;
        this.searchForMembers();
    }
    clearTabSelection() {
        for (let tab of this.tabs) {
            tab.selected = false;
        }
    }
    clearSearchText() {
        this.searchText = "";
        this.clearTabSelection();
    }
    searchForMembers() {
        console.log(`search started using ${this.searchText}`);
    }
    addNewMember() {
        console.log(`add new member requested`);
    }
    diagSearchText() {
        console.log(`search is ${this.searchText}`);
    }
    onFirstNameValidate(cs: ControlState) {
        if (cs.touched) {
            this.validate("firstName", cs.value);
        }
        console.log(`first name change: ${cs.value}, touched = ${cs.touched}`);
    }
    onLastNameValidate(cs: ControlState) {
        if (cs.touched) {
            this.validate("lastName", cs.value);
        }
        console.log(`last name change: ${cs.value}, touched = ${cs.touched}`);
    }
    onBetaButton() {
        console.log(`member = ${JSON.stringify(this.member)}`);
        if (this.validateAll()) {
            console.log(`can save`);
        } else {
            console.log(`cannot save`);
        }
    }
    getValidationResult(prop: string): ValidationResult {
        return <ValidationResult>this.mValidations.get(prop);
        //return this.memberValidations[prop];
    }
    validate(prop: string, value: any) {
        //let vr = this.memberValidations[prop];
        let vr = <ValidationResult>this.mValidations.get(prop);
        vr.valid = true;
        vr.message = "";
        let text: string = value;
        switch (prop) {
            case "firstName":                
                if (text.length === 0) {
                    vr.valid = false;
                    vr.message = `a First Name is required`;
                } else if (text.startsWith("z")) {
                    vr.valid = false;
                    vr.message = `a First Name cannot begin with z`;
                }
                break;
            case "lastName":
                //let text: string = value;
                if (text.length === 0) {
                    vr.valid = false;
                    vr.message = `a Last Name is required`;
                } else if (text.startsWith("z")) {
                    vr.valid = false;
                    vr.message = `a Last Name cannot begin with z`;
                }
                break;
        }
    }
    validateAll(): boolean {
        let invalidPropertyCount = 0;
        this.validate("firstName", this.member.firstName);
        this.validate("lastName", this.member.lastName);
        this.mValidations.forEach((v, k) => {
            if (!v.valid) {
                invalidPropertyCount++;
            }
        });
        return invalidPropertyCount === 0;
    }
    choiceToValues(): EnumValue[] {
        let r: EnumValue[] = [];
        for (var v in Choice) {
            if (typeof Choice[v] === 'number') {
                r.push({value: <any>Choice[v], name: v, selected: false})
            }
        }
        console.log(`${JSON.stringify(r)}`);
        return r;
    }
}
