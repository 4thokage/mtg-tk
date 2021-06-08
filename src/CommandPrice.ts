import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { DeckfileUtils } from './DeckFileUtils';
import { ScryfallSyncService } from './ScryfallSyncService';


type ProxyConfig = {
    file: string
    format: string;
};


export class CommandPrice {

    private readonly usage = [
        {
            header: 'Calculates avg price from deckfile.',
            content: 'mtg-tk price -f <file|extension>',
        },
        {
            header: 'Parameters',
            hide: ['command'],
            optionList: []
        }
    ];

    private readonly paramDef = [
        {
            name: 'command',
            type: String,
            require: true,
            defaultOption: true,
        },
        {
            name: 'file',
            alias: 'f',
            description: 'The file location',
            type: String,
            require: true,
        },
        {
            name: 'type',
            alias: 't',
            description: 'The file deck type (MTGO, Archidekt, etc)',
            type: String,
            require: false,
            defaultOption: 'DEK',
        },
    ];



    exec(): number {
        const cfg = commandLineArgs(this.paramDef) as ProxyConfig;

        // Valid require params
        const requiresNotSetted = this.paramDef
            .filter(x => x.require)
            .filter(x => cfg[x.name] == null)
            .map(x => `--${x.name}`);

        if (requiresNotSetted.length > 0) {
            console.log(`Param: ${requiresNotSetted.join(' ')} is required.`);
            console.log(`------------------------------------`);
            this.usage[1].optionList = this.paramDef;
            const usg = commandLineUsage(this.usage)
            console.log(usg);
            return -1;
        }

        return this.run(cfg);
    }

    private run(cfg: ProxyConfig): number {

        let cards = [];

        DeckfileUtils.readDek(cfg.file, cards);


        const cs = new ScryfallSyncService();
        let sumEur = 0;
        let sumUsd = 0;
        let sumTix = 0;
        cards
            .map(cs.fetchScryfallData)
            .map(card => card.prices)
            .forEach(price => {
                sumEur += Number(price.eur) || 0;
                sumUsd += Number(price.usd) || 0;
                sumTix += Number(price.tix) || 0;
            });

            console.log("EUR: %s | USD: %s | TIX: %s", sumEur, sumUsd, sumTix);

        return 0;

    }

}