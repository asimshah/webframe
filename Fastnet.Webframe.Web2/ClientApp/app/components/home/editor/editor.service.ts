import { Injectable } from '@angular/core';
import { BaseService, ServiceResult } from '../../shared/base.service';
import { Http, RequestOptionsArgs } from '@angular/http';

export class Directory {
    id: number;
    parentId: number;
    name: string;
    fullname: string;
    subdirectoryCount: number;
    constructor() {
        this.name = '';
        this.subdirectoryCount = 0;
    }
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
    modifiedOn: string;
    modifiedBy: string;
    createdOn: string;
    createdBy: string;
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

export class UploadData {
    chunkNumber: number;
    isLastChunk: boolean;
    key: string;
    base64Data: string;
    filename: string;
    mimeType: string;
    filelength: number;
    directoryId: number;
}

export class NewPage {
    type: PageType;
    referencePageId?: number;
    directoryId: number;
    name: string;
}

@Injectable()
export class EditorService extends BaseService {
    constructor(http: Http) {
        super(http);
    }
    async checkContentExists(id: number, name: string): Promise<boolean> {
        let query = `content/check/exists/${id}/${encodeURI(name)}`;
        return new Promise<boolean>(async resolve => {
            let dr = await this.query(query);
            resolve(dr.data);
        });
    }
    async sendChunk(chunk: UploadData): Promise<string | ServiceResult> {
        let query = "content/upload/chunk";

        return new Promise<string | ServiceResult>(async resolve => {
            let dr = await this.post(query, chunk);
            if (dr.success) {
                resolve(dr.data);
            }
            else {
                resolve({ success: false, errors: [dr.message] });
            }
        });
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
    async deletePage(page: Page, dir: Directory) {
        let query = `content/delete/page/${page.id}/${dir.id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, null);
            resolve();
        });
    }
    async deleteDocument(doc: Document, dir: Directory) {
        let query = `content/delete/document/${doc.id}/${dir.id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, null);
            resolve();
        });
    }
    async deleteImage(image: Image, dir: Directory) {
        let query = `content/delete/image/${image.id}/${dir.id}`;
        return new Promise<void>(async resolve => {
            let dr = await this.post(query, null);
            resolve();
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
    async createPage(np: NewPage): Promise<ServiceResult> {
        let query = "content/create/page";
        return new Promise<ServiceResult>(async resolve => {
            let dr = await this.post(query, np);
            if (dr.success) {
                resolve({ success: true, errors: [] });
            } else {
                resolve({ success: false, errors: [dr.message] });
            }
        });
    }
    async updatePage(page: Page): Promise<ServiceResult> {
        let query = "content/update/page";
        return new Promise<ServiceResult>(async resolve => {
            let dr = await this.post(query, page);
            if (dr.success) {
                resolve({ success: true, errors: [] });
            } else {
                resolve({ success: false, errors: [dr.message] });
            }
        });
    }
}
