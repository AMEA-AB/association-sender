#!/usr/bin/env node

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

export default class ActorSmartbookSource extends BaseSource {
    private baseURL: string;

    public static getURL(municipality: string) {
        return `https://${municipality}.actorsmartbook.se/`;
    }

    constructor(municipality: string) {
        super();
        this.baseURL = ActorSmartbookSource.getURL(municipality);
    }

    public static async hasActorSmartbook(municipality: string) {
        const url = ActorSmartbookSource.getURL(municipality);
        return ActorSmartbookSource.isSiteUp(url);
    }

    /**
     * Get all associations
     *
     * @returns {Promise<Association[]>} All associations
     */
    private async getAllAssociations(): Promise<Association[]> {
        return ActorSmartbookSource.fetch<AssociationResponse>(`${this.baseURL}Associations/1/1000000`)
            .then((response) => response.items);
    }

    public async getEmails(): Promise<string[]> {
        const associations = await this.getAllAssociations();
        const emails: string[] = [];
        for (let i = 0; i < associations.length; i++) {
            const association = associations[i];
            const email = association.email;
            emails.push(email);
        }
        return emails.filter((email) => email !== undefined && email !== null && email !== '');
    }
}
