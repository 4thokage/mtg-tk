#!/usr/bin/env node
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import { CommandConvert } from "./CommandConvert";
import { CommandPrice } from './CommandPrice';
import { CommandProxy } from "./CommandProxy";
import { CommandVersion } from "./CommandVersion";

type CommandType = "convert" | "proxy" | "price" | "version";

type MainConfig = {
  command: CommandType,
};

class Main {
  private readonly mainUsage = [
    {
      header: 'Command Line Interface for the Magic the Gathering tools I use the most',
      content: 'Sample for CLI.',
    },
    {
      header: 'Commands',
      content: {
        data: [
          { colA: 'mtg-tk convert -f <file|extension>', colB: 'Convert DEK to other formats.'},
          { colA: 'mtg-tk proxy -f <file|extension> -t <type>', colB: 'Generate a printable pdf with proxies from file.'},
          { colA: 'mtg-tk price -f <file|extension> -t <type>', colB: 'Calculates average price form deckfile.'},
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