﻿
import { Component, forwardRef, Input, EventEmitter, Output, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ListItem } from './controls.types';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { InputControlBase, ControlBase2 } from './controlbase2.type';
import { Data } from '@angular/router';
import { addDays, addMonths, getMonthNames } from '../types/date.functions';

const startDayofWeek: number = 1; // 0 = Sunday

export enum DaysOfTheWeek {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday
}

export class DayStatus {
    filler: boolean = false;
    block: boolean = false;
    disabled: boolean = false;
    classes: string[] = [];
}

export class CalendarDay {
    //date: Date | null;// null if this entry is a blank in the calendar table (ie. this is a filler)
    dayNumber: number;
    // Sunday is 0 (zero)    
    dayOfWeek: DaysOfTheWeek;
    status: DayStatus;
    constructor(public date: Date, filler: boolean = false) {
        this.dayNumber = date.getDate();
        this.dayOfWeek = date.getDay();
        this.status = new DayStatus();
        this.status.filler = filler;
    }
}

@Component({
    selector: 'date-input',
    templateUrl: './date-input.component.html',
    styleUrls: ['./date-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateInputControl),
            multi: true
        },
        {
            provide: ControlBase2, useExisting: forwardRef(() => DateInputControl)
        }
    ],
    encapsulation: ViewEncapsulation.None
})
export class DateInputControl extends InputControlBase implements OnDestroy {
    private static bodyEventAdded = false;
    private static allDateControls: DateInputControl[] = [];
    showCalendar: boolean = false;
    @Input() minDate: Date = new Date(1900, 1, 1);
    @Input() maxDate: Date = new Date(2299, 12, 31);
    @Input() showmonthcount: number = 1;
    @Input() startweekon: DaysOfTheWeek = DaysOfTheWeek.Monday;
    @Output() beforeshowingdate = new EventEmitter<CalendarDay>();
    monthList: calendarMonth[];
    selectedDate: Date | null = null;
    readonly startDay = startDayofWeek;
    private baseDate: Date;
    private readonly dateControlIndex: number;
    private yearRange: ListItem<any>[];
    private weekDays: string[];
    private debugControlArray() {
        console.log(`dic array length: ${DateInputControl.allDateControls.length}`);
        for (let item of DateInputControl.allDateControls) {
            console.log(`Dic index ${item.dateControlIndex}`);
        }
    }
    constructor() {
        super();
        //console.log("constructor()");
        this.dateControlIndex = DateInputControl.allDateControls.length;// DateInput2Control.counter;
        DateInputControl.allDateControls.push(this);
        if (!DateInputControl.bodyEventAdded) {
            document.body.addEventListener("mouseup", () => {
                //console.log(`DateInput2Control: mouse up on body`)
                this.closeAll();
            });
            DateInputControl.bodyEventAdded = true;
            //console.log(`body mouseup handler added`);
        }
        this.localChangeCallBack = (v) => { this.isTouched = true; };
        this.afterValidationCallBack = () => { this.isTouched = false; };
        //this.debugControlArray();
    }
    ngOnDestroy() {
        //console.log("ngOnDestroy()");
        //this.debugControlArray();
        let index = DateInputControl.allDateControls.findIndex((d) => d === this);
        if (index >= 0) {
            DateInputControl.allDateControls.splice(index, 1);
        } 
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

    onMouseUp(e: MouseEvent) {
        if (this.showCalendar === true) {
            this.onCloseCalendar();
        } else {
            this.initialise();
            this.openCalendar();
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
    onDayClick( cm: calendarMonth, cd: CalendarDay) {
        if (!cd.status.block) {
            this.value = cd.date;
            this.selectedDate = cd.date;
            this.onCloseCalendar();
            //this.isTouched = true;
        }
    }
    onBackOneMonth() {
        this.baseDate = addMonths(this.baseDate, -1);
        this.buildCalendar();
    }
    onForwardOneMonth() {
        this.baseDate = addMonths(this.baseDate, 1);
        this.buildCalendar();
    }
    onYearChange(val: ListItem<any>, cm: calendarMonth, index: number) {
        try {
            console.log(`year change ${cm.name} ${JSON.stringify(val)}`);
            this.baseDate = new Date(val.value, cm.month, 1);
            if (index > 0) {
                this.baseDate = addMonths(this.baseDate, -index);
            }
            console.log(`new base date  ${this.baseDate.toLocaleString()}`);
            this.buildCalendar();
        } catch (e) {
            debugger;
        }
    }
    isSelectedDate(d: Date) {
        if (this.selectedDate === null) {
            return false;
        }
        return this.selectedDate.getTime() === d.getTime();
    }
    getDayClasses(cd: CalendarDay): string[] {
        let names: string[] = [];
        if (cd.date) {

            if (this.isSelectedDate(cd.date)) {
                names.push('selected');
            }
            
            if (cd.status.disabled === true) {
                names.push('disabled');
                return names;
            } else {
                names.push('normal');
            }
            for (let x of cd.status.classes) {
                names.push(x);
            }
        }
        return names;
    }
    private initialise() {
        //debugger;
        let today = new Date();
        this.baseDate = today;
        if (this.value) {
            let d = <Date>this.value;
            this.baseDate = new Date(d.getFullYear(), d.getMonth(), d.getDay());
        }
        this.buildWeekDays();
        let minY = this.minDate.getFullYear();
        let maxY = this.maxDate.getFullYear();
        this.buildYearRange(minY, maxY);
        this.buildCalendar();
    }
    private buildCalendar() {
        //console.log(`min date ${this.minDate}, max date ${this.maxDate}`);
        let monthNumber = this.baseDate.getMonth(); // range 0 - 11;
        let yearNumber = this.baseDate.getFullYear();
        //console.log(`showing ${this.monthsToDisplay} months, cd = ${this.baseDate.toDateString()}, startmonth is ${monthIndex}`);
        this.monthList = [];
        for (let i = 0; i < this.showmonthcount; ++i) {
            let cm: calendarMonth = new calendarMonth(monthNumber, yearNumber, this.yearRange, (cd) => {
                //let status = new DayStatus();
                let disabled = false;
                if (this.minDate) {
                    disabled = cd.date.getTime() < this.minDate.getTime();
                }
                if (disabled === false && this.maxDate) {
                    disabled = cd.date.getTime() > this.maxDate.getTime();
                }
                let selected = this.value && this.value.getTime() === cd.date.getTime();
                if (selected === true) {
                    this.selectedDate = cd.date;
                }
                this.beforeshowingdate.emit(cd);
                return status;
            });// { name: m, year: yearIndex, month: monthIndex - 1, days: [], availableYears:[] };
            this.monthList.push(cm);
            monthNumber++;
            if (monthNumber > 11) {
                monthNumber = 0;
                yearNumber++;
            }
        }
        //for (let cm of this.monthList) {
        //    let year = cm.year.value as number;
        //    let fd = new Date(Date.UTC(year, cm.month, 1));
        //    cm.availableYears = [];
        //    for (let y = year - this.offsetYearFrom; y < year + this.offsetYearTo + 1; ++y) {
        //        let li = new ListItem<any>();
        //        li.value = y;
        //        li.name = y.toString();
        //        cm.availableYears.push(li);
        //    }
        //    let fd_dayofWeek = fd.getDay();
        //    let startOffset = fd_dayofWeek - startDayofWeek; // offset = 0 if the first day of the month is a Sunday (if startDayofWeek is 0)
        //    let dw = startDayofWeek;
        //    for (let i = 0; i < startOffset; ++i) {
        //        cm.days.push({ date: null, dayNumber: 0, dayOfWeek: dw, disabled: false, status: new DayStatus() })
        //        dw++;
        //        if (dw > 6) {
        //            dw = 0;
        //        }
        //    }
        //    let finished = false;
        //    let d = fd;
        //    do {
        //        let disabled = false;
        //        if (this.minDate) {
        //            disabled = d.getTime() < this.minDate.getTime();
        //        }
        //        if (disabled === false && this.maxDate) {
        //            disabled = d.getTime() > this.maxDate.getTime();
        //        }
        //        let selected = this.value && this.value.getTime() === d.getTime();
        //        if (selected === true) {
        //            this.selectedDate = d;
        //        }
        //        let status: DayStatus = this.beforeDateLoaded ? this.beforeDateLoaded(d) : new DayStatus();
        //        //console.log(`${d.toDateString()} ${JSON.stringify(status)}`);
        //        cm.days.push({ date: d, dayNumber: d.getDate(), dayOfWeek: d.getDay(), disabled: disabled, status: status });
        //        d = this.addDay(d);
        //        if (fd.getMonth() !== d.getMonth()) {
        //            finished = true;
        //        }
        //    } while (finished === false);
        //    //console.log(`${JSON.stringify(cm, null, 2)}`);
        //}
    }
    private ensureDate(d: string | Date): Date {
        if (typeof d === "string") {
            return new Date(d);
        }
        return d;
    }
    private buildYearRange(miny: number, maxy:number) {
        this.yearRange = [];
        let year = this.baseDate.getFullYear();
        for (let y = miny; y <= maxy; ++y) {
            let li = new ListItem<any>();
            li.value = y;
            li.name = y.toString();
            this.yearRange.push(li);
        }
    }
    private openCalendar() {

        for (let c of DateInputControl.allDateControls) {
            if (c !== this) {
                c.onCloseCalendar();
            }
        }
        this.showCalendar = true;
        //console.log(`opening date control number ${this.dateControlIndex}`);
    }
    private closeAll() {
        //let arr = ControlBase.allControls.values();
        //for (let c of arr) {
        //    if (c instanceof DateInput2Control) {
        //        let x = c as DateInput2Control;
        //        x.onCloseCalendar();
        //    }
        //}
        for (let c of DateInputControl.allDateControls) {
            c.onCloseCalendar();
        }
    }
    private buildWeekDays() {
        this.weekDays = [];
        let start = <number>this.startweekon;
        for (let i = 0; i < 7; ++i) {
            let wd = DaysOfTheWeek[start];
            this.weekDays.push(wd.substr(0, 2));
            start++;
            if (start > 6) {
                start = 0;
            }
        }
    }
}

class calendarMonth {
    name: string;
    year: ListItem<any>;
    days: CalendarDay[] = [];

    constructor(public month: number, year: number, private yearRange: ListItem<any>[], setDayStatus: (cd: CalendarDay) => void) {
        //this.name = monthNames[month];
        this.name = getMonthNames()[month];
        // m = 0 - 11
        // year is 4 digit year, e.g. 2018
        let y = yearRange.find(x => x.value === year);// {name: year.toString(), value: year};
        if (y) {
            this.year = y;
        } else {
            throw `year ${year} is not in the provided year range`;
        }
        this.buildMonthCalendar(setDayStatus);
    }
    private buildMonthCalendar(setDayStatus: (cd: CalendarDay) => void) {
        //let year = cm.year.value as number;
        let fd = new Date(Date.UTC(this.year.value, this.month, 1));

        let fd_dayofWeek = fd.getDay();
        let numberToFill = fd_dayofWeek - startDayofWeek;
        let firstFillerDay = addDays(fd, -numberToFill);
        let fillerDate = firstFillerDay;
        for (let i = 0; i < numberToFill; ++i) {
            let cd = new CalendarDay(fillerDate, true);
            this.days.push(cd);
            fillerDate = addDays(fillerDate, 1);
        }
        //let startOffset = fd_dayofWeek - startDayofWeek; // offset = 0 if the first day of the month is a Sunday (if startDayofWeek is 0)
        //let dw = startDayofWeek;
        //// first fill the part of the days array that is before the first day of the month
        //// i.e. the bit that allows us to start on a Sunday, say, or a Monday as specified by startDayOfweek
        //for (let i = 0; i < startOffset; ++i) {
        //    let cd - new CalendarDay();
        //    this.days.push({ date: null, dayNumber: 0, dayOfWeek: dw, status: new DayStatus() })
        //    dw++;
        //    if (dw > 6) {
        //        dw = 0;
        //    }
        //}
        let finished = false;
        let d = fd;
        do {
            let cd = new CalendarDay(d);

            //let status = setStatus(d);
            setDayStatus(cd);
            //this.days.push({ date: d, dayNumber: d.getDate(), dayOfWeek: d.getDay(), status: status });
            this.days.push(cd);
            d = addDays(d, 1);// this.addDay(d);
            if (fd.getMonth() !== d.getMonth()) {
                finished = true;
            }
        } while (finished === false);
            //console.log(`${JSON.stringify(cm, null, 2)}`);
    }
}
