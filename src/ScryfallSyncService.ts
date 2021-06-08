var request = require('sync-request');

export class ScryfallSyncService {
    fetchScryfallData(card: any) {
        let res = request('GET', 'https://api.scryfall.com/cards/named?exact=' + card[3]); // card name
        let cardData = JSON.parse(res.body.toString());

        cardData.count = card[1]; // card count
        return cardData;

    };

    fetchCardImage(cardData: any) {
        let response = request('GET', cardData.image_uris['normal'])
        return {
            data: "data:" + response.headers["content-type"] + ";base64," + Buffer.from(response.body).toString('base64'),
            count: cardData.count
        }
    }
}
