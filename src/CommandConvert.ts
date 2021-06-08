import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as fs from 'fs';
import * as path from 'path';
import { DeckfileUtils } from './DeckFileUtils';


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

        const fileNoExt = path.parse(cfg.file).name;
        let cards = [];

        DeckfileUtils.read(cfg.file, cards);


        DeckfileUtils.writeFile(fileNoExt + ".csv", convert2CSV(cards));
        DeckfileUtils.writeFile(fileNoExt + "-BBCODE.txt", convert2BBCode(cards, cfg.file));
        DeckfileUtils.writeFile(fileNoExt + "-deckstats.txt", convert2DeckStats(cards));
        DeckfileUtils.writeFile(fileNoExt + ".dec", convert2Dec(cards));

        return 0;

    }
}

function convert2Dec(cards: string[]) {
    var deckText: string;
    deckText = "";
    cards.forEach(function (card) {
        var location: string;
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

function convert2DeckStats(cards: string[]) {
    let deckText = "";
    let sideArr = [];
    let deckArr = [];

    let appendCard = function (card: string[]) {
        return deckText += card[1] + " " + card[3] + "\n";
    };

    cards.forEach(function (card) {
        if (card[2] === "false") {
            return deckArr.push(card);
        } else {
            return sideArr.push(card);
        }
    });
    deckArr.forEach(appendCard);
    if (sideArr.length > 0) {
        deckText += "\n//Sideboard\n";
        sideArr.forEach(appendCard);
    }
    return deckText;
};

function convert2BBCode(cards: any[], filename: string) {
    let deckText = "[DECK= " + filename + "]\n";
    let sideArr = [];
    let deckArr = [];
    let appendCard = function (card: string[]) {
        return deckText += card[1] + " " + card[3] + "\n";
    };
    cards.forEach(function (card: string[]) {
        if (card[2] === "false") {
            return deckArr.push(card);
        } else {
            return sideArr.push(card);
        }
    });
    deckArr.forEach(appendCard);
    if (sideArr.length > 0) {
        deckText += "\nSideboard\n";
        sideArr.forEach(appendCard);
    }
    deckText += "[/DECK]\n";
    return deckText;
};

function convert2CSV(cards: any[]) {
    let deckText = "Count,Card,Sideboard,\n";
    let sideArr = [];
    let deckArr = [];

    let appendCard = function (card: string[]) {
        return deckText += "\"" + card[1] + "\",\"" + card[3] + "\",\"false\",\n";
    };
    let appendSbCard = function (card: string[]) {
        return deckText += "\"" + card[1] + "\",\"" + card[3] + "\",\"true\",\n";
    };

    cards.forEach(function (card: string[]) {
        if (card[2] === "false") {
            return deckArr.push(card);
        } else {
            return sideArr.push(card);
        }
    });
    deckArr.forEach(appendCard);
    if (sideArr.length > 0) {
        sideArr.forEach(appendSbCard);
    }
    return deckText;
};