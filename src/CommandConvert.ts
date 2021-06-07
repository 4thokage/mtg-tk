import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import * as path from 'path';


type ConverterConfig = {
    file: string
};

export class CommandConvert {

    private readonly usage = [
        {
            header: 'Convert a DEK file to various formats.',
            content: 'mtg-tk convert -f <file|extension>',
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
            description: 'The DEK file location',
            type: String,
            require: true,
        },
    ];



    exec(): number {
        const cfg = commandLineArgs(this.paramDef) as ConverterConfig;

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

    private run(cfg: ConverterConfig): number {

        const CARDREGEXP = /(cards((\s+\w+=\"[^\"]+\")+))/im;
        let newFileName = path.dirname(cfg.file) + "/" + path.basename(cfg.file, '.dek');

        let cards = [];

        const data = fs.readFileSync(cfg.file, 'UTF-8');
        const lines = data.split(/\r?\n/);

        lines.forEach((line) => {
            let hit = CARDREGEXP.exec(line);

            if (hit !== null) {
                let card = hit[1].trim().split(/Cards\s|"\s|\=\"|\"/);
                card.splice(0, 1);
                card.splice(0, 1);
                card.splice(1, 1);
                card.splice(2, 1);
                card.splice(3, 1);
                card.splice(4, 1);
                return cards.push(card);
            }
        });
        return writeFile(newFileName + ".dec", renderDec(cards));

    }
}

function writeFile(location: string, text: any): number {
    let error: any;
    console.log("Writing " + location + "...");
    try {
        fs.writeFileSync(location, text);
    } catch (_error) {
        error = _error;
        console.log(error);
        return -1;
    }
    return 0;
}

function renderDec(cards: string[]) {
    var deckText;
    deckText = "";
    cards.forEach(function (card) {
        var location;
        if (card[2] === "false") {
            location = "Deck";
        } else {
            location = "SB";
        }
        if (location === "SB") {
            deckText += "SB: ";
        }
        return deckText += card[1] + " " + card[3] + "\n";
    });
    return deckText;
};
