import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class Settings {
    public readonly dataFolder: string;
    public transportOptions: SMTPTransport | SMTPTransport.Options;
    public mail: SMTPTransport.Options;
    public dryRun: boolean;
    public limit?: number;

    constructor(dataFolder: string, transportOptions: SMTPTransport | SMTPTransport.Options, mail: SMTPTransport.Options, dryRun: boolean = false, limit: number | undefined = 185) {
        this.dataFolder = dataFolder;
        this.transportOptions = transportOptions;
        this.mail = mail;
        this.dryRun = dryRun;
        this.limit = limit;
    }

    public get addressesFile(): string {
        return `${this.dataFolder}/addresses.json`;
    }

    public get optOutFile(): string {
        return `${this.dataFolder}/opt-out.json`;
    }

    public get sentFile(): string {
        return `${this.dataFolder}/sent.json`;
    }
}