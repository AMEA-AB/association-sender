import { inspect } from 'util';
import municipalities from './assets/municipalities.json'
import MailService from './services/mail-service';
import RbokSource from './sources/rbok-source';
import IbgoSource from './sources/ibgo-source';
import FileService from './services/file-service';
import settings from '../settings';

type Source = 'rbok' | 'ibgo';

async function populate(sources: Source[] = [], exclude: string[] = []) {
    const fileService = new FileService();
    let emails: string[] = fileService.loadJsonFromFile<string[]>(settings.addressesFile);

    for(let i = 0; i < municipalities.length; i++) {
        let municipality = municipalities[i];
        municipality = municipality
            .replace(/Å/g, 'A')
            .replace(/Ä/g, 'A')
            .replace(/Ö/g, 'O')
            .replace(/å/g, 'a')
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/ /g, '-');
        if (exclude.includes(municipality)) {
            continue;
        }
        if (sources.includes('rbok')) {
            if(await RbokSource.hasRbok(municipality)) {
                const rbokService = new RbokSource(municipality);
                const rbokEmails = await rbokService.getEmails();
                emails.push(...rbokEmails);
            }
        }

        if (sources.includes('ibgo')) {
            if(await IbgoSource.hasIbgo(municipality)) {
                const ibgoService = new IbgoSource(municipality);
                const ibgoEmails = await ibgoService.getEmails();
                emails.push(...ibgoEmails);
            }
        }
    }

    emails = [...new Set(emails)].filter((mail) => !exclude.includes(mail));

    fileService.saveJsonToFile(settings.addressesFile, emails);
}

async function send() {
    const mailService = new MailService(settings);
    await mailService.processMails();
}

send().catch((error) => {
    console.error('Error in sending emails:', inspect(error));
});

/* populate(['ibgo']).catch((error) => {
    console.error('Error in populate:', inspect(error));
}); */