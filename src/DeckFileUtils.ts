import * as fs from 'fs';
import * as path from 'path';

export class DeckfileUtils {
    static readDek(file: string, cards: any[]): any {

        const data = fs.readFileSync(file, 'UTF-8');
        const lines = data.split(/\r?\n/);

        const CARDREGEXP = /(cards((\s+\w+=\"[^\"]+\")+))/im;
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
      }

    static writeFile(file: string, text: any): number {

        let newFileName = path.dirname(file) + "/" + path.basename(file, '.dek');
        let error: any;
        console.log("Writing " + newFileName + "...");
        try {
            fs.writeFileSync(newFileName, text);
        } catch (_error) {
            error = _error;
            console.log(error);
            return -1;
        }
        return 0;
    }
}