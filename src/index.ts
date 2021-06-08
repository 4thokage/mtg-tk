#!/usr/bin/env node
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { CommandConvert } from "./CommandConvert";
import { CommandMana } from './CommandMana';
import { CommandPrice } from './CommandPrice';
import { CommandProxy } from "./CommandProxy";
import { CommandVersion } from "./CommandVersion";

type CommandType = "convert" | "proxy" | "price" | "mana" | "version";

type MainConfig = {
  command: CommandType,
};

class Main {
  private readonly mainUsage = [
    {
      header: 'MTG-Tk',
      content: 'A bunch of Magic: The Gathering tools I use, bundled together.',
    },
    {
      header: 'Commands',
      content: {
        data: [
          { colA: 'mtg-tk convert -f <file|extension>', colB: 'Parse input deckfile (deck) and converts to other formats.'},
          { colA: 'mtg-tk proxy -f <file|extension> -t <type>', colB: 'Generate a printable pdf with proxies from deckfile.'},
          { colA: 'mtg-tk price -f <file|extension> -t <type>', colB: 'Calculates average price form deckfile.'},
          { colA: 'mtg-tk mana -f <file|extension> -t <type>', colB: 'Calculates simple mana base from deckfile.'},
          { colA: 'mtg-tk version', colB: 'Show version.'},
        ],
        options: { maxWidth: 100 }
      }    
    }
  ];

  private readonly paramDef = [
    {
      name: 'command', 
      type: String,
      require: true,
      defaultOption: true,
    }
  ];

  private commandMap =  new Map<CommandType, ()=>number>([
    [ "convert", () => new CommandConvert().exec() ],
    [ "proxy", () => new CommandProxy().exec() ],
    [ "price", () => new CommandPrice().exec() ],
    [ "mana", () => new CommandMana().exec() ],
    [ "version", () => new CommandVersion().exec() ],
  ]);
  
  run() {
    const cfg = commandLineArgs(this.paramDef, { partial: true }) as MainConfig;

    const exec = this.commandMap.get(cfg.command);
    if (exec != null) {
      const ret = exec();
      process.exit(ret);
    } else {
      const usg = commandLineUsage(this.mainUsage);
      console.log(usg);
      process.exit(1);
    }
  }
};

new Main().run();