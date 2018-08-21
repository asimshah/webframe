import { Injectable } from '@angular/core';
import { BaseService, ServiceResult } from '../../shared/base.service';
import { Http } from '@angular/http';

export class Directory {
    id: number;
    parentId: number;
    name: string;
    subdirectoryCount: number;
}

export enum ContentType {
    Page,
    Document,
    Image
}

export enum PageType {
    Centre,
    Banner,
    Left,
    Right
}
export interface IContent {
    type: ContentType;
    id: number;
    url: string;
    name: string;
    iconUrl: string
}
export class Page implements IContent {
    type: ContentType;
    id: number;
    url: string;
    name: string;
    iconUrl: string;
    pageType: PageType;
    landingPage: boolean;
    landingPageIconUrl: string;
    pageTypeTooltip: string;
}
export class Document implements IContent {
    type: ContentType;
    id: number;
    url: string;
    name: string;
    iconUrl: string;
}
export class Image implements IContent {
    type: ContentType;
    id: number;
    url: string;
    name: string;
    iconUrl: string;
    size: string;
}
export class Content {
    pages: Page[] = [];
    documents: Document[] = [];
    images: Image[] = [];
    isEmpty() {
        return this.pages.length == 0 && this.documents.length == 0 && this.images.length == 0;
    }
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
    async getDirectoryContent(id: number) : Promise<Content> {
        let query = `content/get/files/${id}`;
        return new Promise<Content>(async resolve => {
            let dr = await this.query(query);
            if (dr.success) {
                let data = <Content>dr.data;
                let c = new Content();
                c.documents = data.documents;
                c.images = data.images;
                c.pages = data.pages;
                resolve(c);
            } else {
                resolve(new Content());
            }
        });
    }
    async deleteDirectory(id: number) {
        let query = `content/delete/directory/${id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, null);
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
