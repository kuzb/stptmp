import { bold, red } from 'std/fmt/colors';
import { Command, ValidationError } from 'cliffy';

import DevelopmentError from '/libs/DevelopmentError.ts';
import { initCommand } from '/commands/init.ts';
import { version } from '/version.ts';

const dev = Deno.env.get('DEVELOPMENT') === 'true';

const print = (str: string) => console.log(bold(red(str)));

const cmd = new Command()
  .name('stptmp')
  .description('Set up a new project from a template.')
  .version(version)
  .command('init', initCommand);

try {
  await cmd.parse(Deno.args);
} catch (error) {
  if (error instanceof ValidationError) cmd.showHelp();
  else if (error instanceof DevelopmentError) dev && console.error(error);
  else print(error.message);

  Deno.exit(1);
}
