import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { forwardRef, Component, Input } from "@angular/core";
import { TextInputControl } from "./text-input.component";
import { ControlBase } from "./controls.component";
import { ControlState, ValidationResult } from "./controls.types";

@Component({
    selector: 'email-input',
    template: `<div class="text-input" [ngClass]="{'not-valid': vr && vr.valid === false}" >
            <label>
                <span>{{label}}</span>
            <input #focusable type="email" [(ngModel)]="value" (blur)="onBlur()" (input)="onInput()"/>
            </label>
            <div class="validation-text">
                <span *ngIf="vr && vr.valid === false" class="text-error">{{vr.message}}</span>
            </div>
        </div>`,
    styleUrls: ['./controls.component.scss', './email-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmailInputControl),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => EmailInputControl)
        }
    ]
})
export class EmailInputControl extends TextInputControl {
    private defaultEmailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    @Input() label: string = '';
    //@ViewChild('focusable') focusableElement: ElementRef;
    constructor() {
        super();
        this.setPrevalidator((cs) => this.validateEmailAsync(cs));
    }
    //focus() {
    //    //console.log(`focusing ..${JSON.stringify(this.element)}`);
    //    this.element.nativeElement.focus();
    //}
    private validateEmailAsync(cs: ControlState): Promise<ValidationResult> {
        return new Promise<ValidationResult>((resolve) => {
            let text: string = cs.value || "";
            if (text.length > 0) {
                if (!this.defaultEmailPattern.test(cs.value)) {
                    cs.validationResult.valid = false;
                    cs.validationResult.message = "This is not a valid email address";
                }
            }
            resolve(cs.validationResult);
        });
    }
}