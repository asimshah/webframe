
export enum ValidationContext {
    ValueChanged,
    LostFocus,
    UserCall
}

//export class ControlState {
//    context: ValidationContext;
//    touched: boolean;
//    value: any;
//    validationResult: ValidationResult;
//    constructor() {
//        this.validationResult = new ValidationResult();
//        //this.validationResult.valid = true;
//        //this.validationResult.message = "";
//    }
//}
export class ValidationResult {
    valid: boolean;
    message: string;
    constructor() {
        this.valid = true;
        this.message = '';
    }
}

//export type Validator = (v: ControlState) => Promise<ValidationResult>;

//export class PropertyValidatorAsync {
//    validationResult: ValidationResult;
//    validator: Validator;
//    constructor(validator: Validator) {
//        this.validator = validator;
//        this.validationResult = new ValidationResult();
//    }
//}

export class ListItem<T> {
    value: T;
    name: string;
}
export class EnumValue extends ListItem<number> {

}

