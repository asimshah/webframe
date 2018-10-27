import { Component, OnInit, } from '@angular/core';
import { BookingAdminService, Price } from './booking-admin.service';
import { ValidationContext, ValidationResult } from '../../../fastnet/controls/controls.types';
import { isNullorUndefined, isWhitespaceOrEmpty } from '../../../fastnet/controls/controlbase.type';
import { getDateWithZeroTime } from '../../../fastnet/core/date.functions';
import { toArray } from 'tinymce';


@Component({
    selector: 'booking-pricing',
    templateUrl: './booking-pricing.component.html',
    styleUrls: ['./booking-pricing.component.scss']
})
export class BookingPricingComponent implements OnInit  {
    modelPrice: Price = new Price()
    prices: Price[] = [];
    isEditing = false;
    constructor(private adminService: BookingAdminService) {

    }
    async ngOnInit() {
        await this.loadprices();
    }
    async loadprices() {
        this.prices = await this.adminService.getPrices();
        for (let p of this.prices) {
            p.from = new Date(<string><any>p.from);
        }
    }
    getFormCaption(): string {
        return this.isEditing ? "Edit Price" : "Add a New Price";
    }
    canRemove(p: Price): boolean {
        let index = this.prices.findIndex(x => x.priceId === p.priceId);
        let temp: Price[] = [];
        for (let price of this.prices) {
            if (p.priceId !== price.priceId) {
                temp.push(price);
            }
        }
        return this.isPriceAvailable(temp) ;
    }
    async addPrice() {
        await this.adminService.addPrice(this.modelPrice);
        await this.loadprices();
        this.modelPrice = new Price();
    }
    async saveChanges() {
        await this.adminService.editPrice(this.modelPrice);
        await this.loadprices();
        this.isEditing = false;
        this.modelPrice = new Price();
    }
    async onEditPrice(p: Price) {
        this.isEditing = true;
        this.modelPrice = p;
    }
    async onRemovePrice(p: Price) {
        await this.adminService.removePrice(this.modelPrice);
        await this.loadprices();
        this.isEditing = false;
        this.modelPrice = new Price();
    }
    async onCancel() {
        this.isEditing = false;
        this.modelPrice = new Price();
    }
    private isPriceAvailable(prices: Price[]): boolean {
        let today = getDateWithZeroTime(null);
        let r = prices.some(p => today.valueOf() >= p.from.valueOf() && p.isRolling || today.valueOf() < p.to!.valueOf());
        console.log(`isPriceAvailable: ${r}`);
        return r;
    }
    priceValidatorAsync(context: ValidationContext, value: any): Promise<ValidationResult> {
        console.log(`validating price ...`);
        return new Promise<ValidationResult>((resolve) => {
            let vr = new ValidationResult();
            if (isNullorUndefined(value)) {
                vr.valid = false;
                vr.message = `a price per bed is required`;
            }
            resolve(vr);
        });
    }
}
