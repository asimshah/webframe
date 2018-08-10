import { Injectable, Directive } from '@angular/core';
import { BaseService } from './base.service';
import { Http } from '@angular/http';

export class Directory {
    id: number;
    name: string;
    subdirectoryCount: number;
}


@Injectable()
export class ContentService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getDirectories(parentId?: number): Promise<Directory[]> {
        let query = parentId ? `content/get/directories/${parentId}` : `content/get/directories`;
        return new Promise<Directory[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
}
