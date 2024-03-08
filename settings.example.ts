import Settings from "./src/settings";

const emailText = `
Hej!

Mitt namn är Albin,
Jag hör av mig till er eftersom jag är övertygad om att våra produkter är perfekt för att hylla prestationer och utmärkelser inom er förening.

Här är en översikt över våra tjänster:
Medaljer: Vi skapar medaljer efter era önskemål. Oavsett om det är för säsongens spelare, bästa målskytt, eller andra utmärkelser, kan vi anpassa medaljerna för att passa era behov.
Diplom: Våra diplomer är elegant designade och kan skräddarsys med er förenings logotyp och önskad text. De är perfekta för att hylla prestationer och framsteg inom er föreningen. Ett lyxigare diplom helt enkelt. Stativ går att köpa till. 
“Merch” med logotyp: Vi erbjuder möjligheten att skapa merchandise med er förenings logotyp som ni kan sälja till era medlemmar. 

Vi skulle gärna vilja samarbeta med er förening och hjälpa er att skapa minnesvärda ögonblick för era medlemmar. Om ni är intresserade, vänligen svara på detta meddelande.

Tack för er tid och vi ser fram emot att höra från er!

Med vänliga hälsningar,
Albin på Spoties

`;

export default new Settings(
    'data',
    {
        port: 465,
        host: "mailcluster.loopia.se",
        auth: {
            user: "username",
            pass: "password"
        },
        secure: true,
    },
    {
        text: emailText,
        from: 'Spoties.se <info@spoties.se>',
        subject: "Produkter för er förening",
        attachments: [
            {
                path: 'produkter.pdf'
            }
        ]
    },
    false,
    185
);