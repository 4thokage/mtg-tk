import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { DeckfileUtils } from './DeckFileUtils';
import { jsPDF } from "jspdf";
import { ScryfallSyncService } from './ScryfallSyncService';
var request = require('sync-request');


type ProxyConfig = {
    file: string
    format: string;
};


export class CommandProxy {

    private readonly usage = [
        {
            header: 'Generate a printable pdf with proxies from file.',
            content: 'mtg-tk proxy -f <file|extension>',
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

        const doc = new jsPDF();

        const cs = new ScryfallSyncService();
        let index = 0;
        let x = 0;
        let y = 0;
        cards
            .map(cs.fetchScryfallData)
            .map(cs.fetchCardImage)
            .map((img) => {
                for(img.count in img) {
                    if(index !== 0 && index % 3 === 0) {
                        x = 0;
                        y += 88.9;
                    }
                    if(index !== 0 && index % 9 === 0) {
                        x = 0;
                        y = 0;
                        doc.addPage();
                        index = 0;
                    }

                    doc.addImage(img.data, 'JPEG', x, y, 63.5, 88.9);
                    x += 63.5;
                    index++;
                }

            });

        doc.save(cfg.file + ".pdf");

        return 0;

    }

}