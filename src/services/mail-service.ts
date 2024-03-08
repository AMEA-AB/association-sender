import { Transporter, createTransport } from 'nodemailer';
import FileService from './file-service';
import type Settings from '../settings';

export default class MailService {

    private transporter: Transporter<any>;
    private settings: Settings;
    private fileService: FileService;

    constructor(settings: Settings) {
        this.transporter = createTransport(settings.transportOptions);
        this.settings = settings;
        this.fileService = new FileService();
    }

    public async processMails() {
        const mails = this.fileService.loadJsonFromFile<string[]>(this.settings.addressesFile);
        const optOutMails = this.fileService.loadJsonFromFile<string[]>(this.settings.optOutFile);
        const sentMails = this.fileService.loadJsonFromFile<string[]>(this.settings.sentFile);

        let sent = 0;

        while(mails.length > 0 && (!this.settings.limit || sent < this.settings.limit)) {
            const mail = mails.pop();
            if (!optOutMails.includes(mail) || !sentMails.includes(mail)) {
                await this.sendMail(mail);
                sentMails.push(mail);
                sent++;
            }

            if(sent % 50 === 0 && sent > 0) {
                console.log(`Sent ${sent} mails`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * 20));
            }
        }
        this.fileService.saveJsonToFile(this.settings.sentFile, sentMails);
        this.fileService.saveJsonToFile(this.settings.addressesFile, mails);
        console.log(`DONE - Sent ${sent} mails`);
    }

    public async sendMail(to: string) {
        try {
            if(!this.settings.dryRun) {
                await this.transporter.sendMail({
                    ...this.settings.mail,
                    to
                });
            }
            console.log(`Sent mail to ${to}`);
            return;
        } catch (err) {
            console.log(`Error sending to ${to}`, err);
            return;
        }
    }
} 