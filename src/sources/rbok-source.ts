#!/usr/bin/env node

import BaseSource from "./base-source";

interface Association {
    Id: string;
    Namn: string;
    Omraden: string;
    Verksamheter: string;
}

interface AssociationResponse {
    Data: Association[];
    Total: number;
    AggregateResults: unknown;
    Errors: unknown
}

interface AssociationInformationResponse {
    AdditionalData: unknown;
    ErrorMessage: unknown;
    IsValid: boolean;
    Model: {
        Adress?: string;
        Beskrivning?: unknown;
        Epost?: string;
        Hemsida?: string;
        Kontaktperson?: string;
        Logotyp?: string
        Malgrupper?: string;
        Namn?: string;
        Omraden?: string;
        Ort?: string;
        Postnr?: string;
        Telefon?: string;
        Verksamheter?: string;
    };
    View: string;
}

export default class RbokSource extends BaseSource {
    private baseURL: string;

    public static getURL(municipality: string) {
        return `https://${municipality}.rbok.se/`;
    }

    constructor(municipality: string) {
        super();
        this.baseURL = RbokSource.getURL(municipality);
    }

    public static async hasRbok(municipality: string) {
        const url = RbokSource.getURL(municipality);
        return RbokSource.isSiteUp(url);
    }

    /**
     * Get all associations
     *
     * @returns {Promise<Association[]>} All associations
     */
    private async getAllAssociations(): Promise<Association[]> {
        return RbokSource.fetch<AssociationResponse>(`${this.baseURL}Foreningsregister/ForeningarGrid_Read`)
            .then((response) => response.Data);
    }

    private getAssociationInformation(id: string): Promise<AssociationInformationResponse> {
        return RbokSource.fetch<AssociationInformationResponse>(`${this.baseURL}Foreningsregister/Item?id=${id}`);
    }

    private async getEmail(id: string): Promise<string> {
        const info = await this.getAssociationInformation(id);
        return info.Model.Epost;
    }

    public async getEmails(): Promise<string[]> {
        const associations = await this.getAllAssociations();
        const emails: string[] = [];
        for(let i = 0; i < associations.length; i++) {
            const association = associations[i];
            const email = await this.getEmail(association.Id);
            emails.push(email);
        }
        return emails.filter((email) => email !== undefined && email !== null && email !== '');
    }
}
