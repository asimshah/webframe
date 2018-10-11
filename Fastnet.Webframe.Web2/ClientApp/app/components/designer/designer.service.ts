import { Injectable } from '@angular/core';
import { BaseService, ServiceResult } from '../shared/base.service';
import { Http } from '@angular/http';

export class Menu {
    id: number;
    index: number;
    text: string;
    url: string
}

@Injectable()
export class DesignerService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getMenus() : Promise<Menu[]>{
        let query =`content/get/menus`;
        return new Promise<Menu[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async updateMenus(menus: Menu[]): Promise<ServiceResult> {
        let query = `content/update/menus`;
        return new Promise<ServiceResult>(async resolve => {
            let dr = await this.post(query, menus);
            if (dr.success) {
                resolve({ success: true, errors: [] });
            } else {
                resolve({ success: false, errors: [dr.message] });
            }
        });
    }
}
