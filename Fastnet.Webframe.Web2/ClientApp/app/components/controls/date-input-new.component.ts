
import { Component, forwardRef, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ControlBase } from './controls.component';
import { ListItem } from './controls.types';
import { TextInputControl } from './text-input.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';

const monthNames: string[] = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"];

const startDayofWeek: number = 0; // 0 = Sunday
export class DayStatus {
    block: boolean = false;
    classes: string[] = [];
}
class calendarMonth {
    name: string;
    month: number; // zero based as in Javascript
    year: number;
    days: calendarDay[];
    availableYears: ListItem[];
}
class calendarDay {
    date: Date | null;// null if this entry is a blank in the calendar table (ie. this is a filler)
    dayNumber: number;
    dayOfWeek: number;
    disabled: boolean;
    status: DayStatus;
}

@Component({
    selector: 'date-input-new',
    templateUrl: './date-input-new.component.html',
    styleUrls: ['./date-input-new.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateInput2Control),
            multi: true
        },
        {
            provide: ControlBase, useExisting: forwardRef(() => DateInput2Control)
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class DateInput2Control extends TextInputControl {
    private static bodyEventAdded = false;
    private static counter = 0;
    showCalendar: boolean = false;
    @Input() minDate: Date;
    @Input() maxDate: Date;
    @Input() offsetYearFrom: number = 5;
    @Input() offsetYearTo: number = 5;
    @Input() monthsToDisplay: number = 1;
    @Input() beforeDateLoaded:(d: Date) => DayStatus;
    monthList: calendarMonth[];
    selectedDate: Date | null = null;
    readonly startDay = startDayofWeek;
    private baseDate: Date;
    private readonly dateControlIndex: number;
    constructor() {
        super();
        this.dateControlIndex = DateInput2Control.counter;
        ++DateInput2Control.counter;
        //console.log(`DateInput2Control[${DateInput2Control.counter}]:body mouseup handler added = ${DateInput2Control.bodyEventAdded}`);
        if (!DateInput2Control.bodyEventAdded) {
            document.body.addEventListener("mouseup", () => {
                //console.log(`DateInput2Control: mouse up on body`)
                this.closeAll();
            });
            DateInput2Control.bodyEventAdded = true;
            //console.log(`body mouseup handler added`);
        }
        this.localChangeCallBack = (v) => { this.isTouched = true; };
        this.afterValidationCallBack = () => { this.isTouched = false; };
    }
    standardDate(d: Date): string {
        if (d) {
            let t = d.toISOString();
            return t.substr(0, t.indexOf('T'));
        }
        return "";
    }
    clear() {
        this.value = null;
        this.onCloseCalendar();
    }
    //onModelChange(e: Event) {
    //    console.log(`onModelChange: ${JSON.stringify(e)}`);
    //}
    onMouseUp(e: MouseEvent) {
        //console.log("mouse up");
        //this.isTouched = false;
        if (this.showCalendar === true) {
            this.onCloseCalendar();
        } else {
            this.initialise();
            this.openCalendar();
            //this.showCalendar = true;
        }
        e.preventDefault();
        e.stopPropagation();
    }
    onCloseCalendar() {
        //console.log(`closing date control number ${this.dateControlIndex}`);
        this.showCalendar = false;
    }
    get debug() { return JSON.stringify(this.value, null, 2); }
    stopEvent(e: Event) {
        e.preventDefault();
        e.stopPropagation();
    }
    onDayClick( cm: calendarMonth, cd: calendarDay) {
        if (!cd.status.block) {
            this.value = cd.date;
            this.selectedDate = cd.date;
            this.onCloseCalendar();
            //this.isTouched = true;
        }
    }
    onBackOneMonth() {
        this.baseDate = this.addMonths(this.baseDate, -1);
        this.buildCalendar();
    }
    onForwardOneMonth() {
        this.baseDate = this.addMonths(this.baseDate, 1);
        this.buildCalendar();
    }
    onYearChange(cm: calendarMonth, val: any) {
        this.baseDate = new Date(cm.year, cm.month, 1);
        this.buildCalendar();
    }
    isSelectedDate(d: Date) {
        if (this.selectedDate === null) {
            return false;
        }
        return this.selectedDate.getTime() === d.getTime();
    }
    getDayClasses(cd: calendarDay): string[] {
        let names: string[] = [];
        if (cd.date) {
            if (cd.disabled === true) {
                names.push('disabled');
                return names;
            } else {
                names.push('normal');
            }
            if (this.isSelectedDate(cd.date)) {
                names.push('selected');
            }
            for (let x of cd.status.classes) {
                names.push(x);
            }
        }
        return names;
    }
    private buildCalendar() {
        //console.log(`min date ${this.minDate}, max date ${this.maxDate}`);
        let monthIndex = this.baseDate.getMonth() + 1;
        let yearIndex = this.baseDate.getFullYear();
        //console.log(`showing ${this.monthsToDisplay} months, cd = ${this.baseDate.toDateString()}, startmonth is ${monthIndex}`);
        this.monthList = [];
        for (let i = 0; i < this.monthsToDisplay; ++i) {
            let m = monthNames[monthIndex - 1];
            let cm: calendarMonth = { name: m, year: yearIndex, month: monthIndex - 1, days: [], availableYears:[] };
            this.monthList.push(cm);
            monthIndex++;
            if (monthIndex > 12) {
                monthIndex = 1;
                yearIndex++;
            }
        }
        for (let cm of this.monthList) {
            let fd = new Date(Date.UTC(cm.year, cm.month, 1));
            cm.availableYears = [];
            for (let y = cm.year - this.offsetYearFrom; y < cm.year + this.offsetYearTo + 1; ++y) {
                let li = new ListItem();
                li.value = y;
                li.name = y.toString();
                cm.availableYears.push(li);
            }
            let fd_dayofWeek = fd.getDay();
            let startOffset = fd_dayofWeek - startDayofWeek; // offset = 0 if the first day of the month is a Sunday (if startDayofWeek is 0)
            let dw = startDayofWeek;
            for (let i = 0; i < startOffset; ++i) {
                cm.days.push({ date: null, dayNumber: 0, dayOfWeek: dw, disabled: false, status: new DayStatus() })
                dw++;
                if (dw > 6) {
                    dw = 0;
                }
            }
            let finished = false;
            let d = fd;
            do {
                let disabled = false;
                if (this.minDate) {
                    disabled = d.getTime() < this.minDate.getTime();
                }
                if (disabled === false && this.maxDate) {
                    disabled = d.getTime() > this.maxDate.getTime();
                }
                let selected = this.value && this.value.getTime() === d.getTime();
                if (selected === true) {
                    this.selectedDate = d;
                }
                let status: DayStatus = this.beforeDateLoaded ? this.beforeDateLoaded(d) : new DayStatus();
                //console.log(`${d.toDateString()} ${JSON.stringify(status)}`);
                cm.days.push({ date: d, dayNumber: d.getDate(), dayOfWeek: d.getDay(), disabled: disabled, status: status });
                d = this.addDay(d);
                if (fd.getMonth() !== d.getMonth()) {
                    finished = true;
                }
            } while (finished === false);
            //console.log(`${JSON.stringify(cm, null, 2)}`);
        }
    }
    private ensureDate(d: string | Date): Date {
        if (typeof d === "string") {
            return new Date(d);
        }
        return d;
    }
    // call with a UTC date
    private addDay(d: Date): Date {
        let nd = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        return nd;
    }
    private addMonths(date: Date, months: number) {
        var d = date.getDate();
        date.setMonth(date.getMonth() + +months);
        if (date.getDate() != d) {
            date.setDate(0);
        }
        return date;
    }
    private initialise() {
        //debugger;
        let today = new Date();
        this.baseDate = today;
        if (this.value) {
            let d = <Date>this.value;
            this.baseDate = new Date(d.getFullYear(), d.getMonth(), d.getDay());
        }
        this.buildCalendar();
    }
    private openCalendar() {
        let arr = ControlBase.allControls.values();
        for (let c of arr) {
            if (c instanceof DateInput2Control) {
                if (c !== this) {
                    let x = c as DateInput2Control;
                    x.onCloseCalendar();
                }
            }
        }
        this.showCalendar = true;
        //console.log(`opening date control number ${this.dateControlIndex}`);
    }
    private closeAll() {
        let arr = ControlBase.allControls.values();
        for (let c of arr) {
            if (c instanceof DateInput2Control) {
                let x = c as DateInput2Control;
                x.onCloseCalendar();
            }
        }
    }
}
