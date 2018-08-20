import { Injectable } from '@angular/core';
import { BaseService, ServiceResult } from '../../shared/base.service';
import { Http } from '@angular/http';

export class Directory {
    id: number;
    parentId: number;
    name: string;
    subdirectoryCount: number;
}
@Injectable()
export class EditorService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async getDirectories(parentId?: number): Promise<Directory[]> {
        let query = parentId ? `content/get/directories/${parentId}` : "content/get/directories";
        return new Promise<Directory[]>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                resolve(dr.data);
            } else {
                resolve([]);
            }
        });
    }
    async getDirectoryContent(id: number) {
        let query = `content/get/files/${id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.query(query);
        });
    }
    async deleteDirectory(id: number) {
        let query = `content/delete/directory/${id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.query(query);
            resolve();
        });
    }
    async createDirectory(dir: Directory): Promise<ServiceResult> {
        let query = `content/create/directory`;
        return new Promise<ServiceResult>(async resolve => {
            let dr = await this.post(query, dir)
            if (dr.success) {
                let d = dr.data as Directory;
                dir.id = d.id;
                resolve({ success: true, errors: []});
            } else {
                resolve({success: false, errors: [dr.message] });
            }
        });
    }
}
