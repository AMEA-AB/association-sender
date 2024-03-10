import { inspect } from 'util';
import municipalities from './assets/municipalities.json'
import MailService from './services/mail-service';
import RbokSource from './sources/rbok-source';
import IbgoSource from './sources/ibgo-source';
import ActorSmartbookSource from './sources/actorsmartbook-source';
import FileService from './services/file-service';
import settings from '../settings';

type Source = 'rbok' | 'ibgo' | 'actorSmartbook';

async function writeMunicipalitySources(file: string) {
    const municipalitySources: Record<string, string | undefined> = {};
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
        if(await RbokSource.hasRbok(municipality)) {
            municipalitySources[municipality] = 'rbok';
        }
        else if(await IbgoSource.hasIbgo(municipality)) {
            municipalitySources[municipality] = 'ibgo';
        }
        else if(await ActorSmartbookSource.hasActorSmartbook(municipality)) {
            municipalitySources[municipality] = 'actorSmartbook';
        } else {
            municipalitySources[municipality] = null;
        }
    }
    const fileService = new FileService();
    fileService.saveJsonToFile(file, municipalitySources);
}

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
                const rbokSource = new RbokSource(municipality);
                const rbokEmails = await rbokSource.getEmails();
                emails.push(...rbokEmails);
            }
        }

        if (sources.includes('ibgo')) {
            if(await IbgoSource.hasIbgo(municipality)) {
                const ibgoSource = new IbgoSource(municipality);
                const ibgoEmails = await ibgoSource.getEmails();
                emails.push(...ibgoEmails);
            }
        }
        if (sources.includes('actorSmartbook')) {
            if(await ActorSmartbookSource.hasActorSmartbook(municipality)) {
                const actorSmartbookSource = new ActorSmartbookSource(municipality);
                const actorSmartbookEmails = await actorSmartbookSource.getEmails();
                emails.push(...actorSmartbookEmails);
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

/* populate(['actorSmartbook']).catch((error) => {
    console.error('Error in populate:', inspect(error));
}); */

/* writeMunicipalitySources(`${settings.dataFolder}/municipalities.json`).catch((error) => {
    console.error('Error in writing municipality sources:', inspect(error));
}); */