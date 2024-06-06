#!/usr/bin/env node
import { JSDOM } from 'jsdom';
import BaseSource from "./base-source";

interface Association {
    id: string;
    name: string;
    email: string;
    url: string;
}

interface AssociationResponse {
    items: Association[];
    totalNumItems: number;
    page: number;
}

export default class FriwebSource extends BaseSource {
    private baseURL: string;

    public static getURLs(municipality: string) {
        return [
            `https://fri.${municipality}.se/forening/`,
            `https://friweb.${municipality}.se/forening/`,
            `https://fritid.${municipality}.se/forening/`
        ];
    }

    private getURL(municipality: string) {
        const urls = FriwebSource.getURLs(municipality);
        console.log(urls);
        for (let i = 0; i < urls.length; i++) {
            console.log('Testing URL: ' + urls[i])
            if(FriwebSource.isSiteUp(urls[i])) {
                console.log('URL is up: ' + urls[i]);
                return urls[i];
            }
            console.log('URL is down: ' + urls[i]);
        }
        return null;
    }

    public get headers() {
        return {
            "Cookie": "ASP.NET_SessionId=qwxc5isc5ocnu11qbj42l4ph"
        };
    }

    constructor(municipality: string) {
        super();
        this.baseURL = this.getURL(municipality);
        console.log(this.baseURL);
    }

    public static async hasFriweb(municipality: string) {
        const allChecks = await Promise.all(FriwebSource.getURLs(municipality).map(FriwebSource.isSiteUp));
        console.log(allChecks);
        return allChecks.includes(true);
    }

    private async getAssociationOnPage(page: number) {
        const url = `${this.baseURL}?page=${page}`;
        return fetch(url, {
            headers: this.headers
        })
            .then((response) => response.text())
            .then((htmlDoc) => {
                const dom = new JSDOM(htmlDoc);
                const doc = dom.window.document;
                const rows = doc.querySelectorAll('#associationsList tbody tr');
                const associations: string[] = [];
                rows.forEach((row) => {
                    const detailsURL = row.querySelector('.startpageAssociationLinks')?.attributes.getNamedItem('href')?.value;
                    associations.push(`${this.baseURL}${detailsURL}`);
                });
                console.log(associations);
                return associations;
            });
    }

    private async getAllAssociationDetailURLs() {
        let page = 0;
        let associations: string[] = [];
        while(true) {
            const newAssociations = await this.getAssociationOnPage(page);
            if(newAssociations.length === 0) {
                break;
            }
            associations.push(...newAssociations);
            page++;
        }
        return associations;
    }

    public async getEmails(): Promise<string[]> {
        const associationsDetailUrls = await this.getAllAssociationDetailURLs();

        const emails: string[] = [];
        for (let i = 0; i < associationsDetailUrls.length; i++) {
            const associationDetailUrl = associationsDetailUrls[i];
            const email = await fetch(associationDetailUrl, {
                headers: this.headers
            })
                .then((response) => response.text())
                .then((htmlDoc) => {
                    const dom = new JSDOM(htmlDoc);
                    const doc = dom.window.document;
                    const email = doc.querySelector('tr a[href^="mailto:"]')?.innerHTML;
                    return email;
                });
            emails.push(email);
        }
        return emails.filter((email) => email !== undefined && email !== null && email !== '');
    }
}
