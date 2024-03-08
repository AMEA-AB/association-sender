import BaseSource from "./base-source";

interface AssociationResponse {
    sEcho: unknown;
    aaData: AssociationResponsePrem;
    iTotalRecords: number;
    iTotalDisplayRecords: number;
}

interface AssociationResponsePrem {
    TotalNumberOfElements: number;
    Customers: Association[];
}

interface Association {
    Id: number;
    Name: string;
    WebSite: string;
    DistrictName: string;
    AssociationCategoryName: string;
    Address: string;
    ZipCode: string;
    City: string;
    Phone: string;
    Email: string;
    PublicInformation: string;
    CustomerOccupationsText: string;
    CustomerOccupationsDivs: string;
    CustomerContactPeople: unknown[];
}

export default class IbgoSource extends BaseSource {

    private municipality: string;

    constructor(municipality: string) {
        super();
        this.municipality = municipality;
    }

    static async getURL(municipality: string): Promise<[string, boolean]> {
        const url = `https://ibgo.${municipality}.se/AssociationRegister/GetAssociationsList`;
        if(await IbgoSource.isSiteUp(url)) {
            return [url, true];
        } else {
            return [`https://${municipality}.ibgo.se/APIAssociationRegister/GetAssociationsList`, false];
        }
    }

    public static async hasIbgo(municipality: string) {
        const [url, onprem] = await IbgoSource.getURL(municipality);
        if(!onprem) {
            return IbgoSource.isSiteUp(url);
        } else {
            return true;
        }
    }

    private async getAllAssociations() {
        const [url] = await IbgoSource.getURL(this.municipality);
        return IbgoSource.fetch<AssociationResponse | AssociationResponsePrem>(url)
            .then((response) => {
                if('aaData' in response) {
                    return response.aaData.Customers;
                }
                return response.Customers;
            });
    }

    public async getEmails(): Promise<string[]> {
        const associations = await this.getAllAssociations();
        const emails: string[] = [];
        for (let i = 0; i < associations.length; i++) {
            const association = associations[i];
            const email = association.Email;
            emails.push(email);
        }
        return emails.filter((email) => email !== undefined && email !== null && email !== '');
    }
}