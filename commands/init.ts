import { Command, Input, Select } from 'cliffy';
import { join } from 'std/path';

import Git, { Repos } from '/libs/Git.ts';
import Cache from '/libs/Cache.ts';
import ProcessUtil from '/utils/ProcessUtil.ts';
import FileUtil from '/utils/FileUtil.ts';
import NpmUtil from '/utils/NpmUtil.ts';

const status = {
  public: '',
  private: '',
};

const init = async () => {
  const octokit = new Git({ auth: Deno.env.get('GITHUB_PACKAGES_TOKEN') });
  const cache = new Cache();

  let templates: Repos | undefined = undefined;

  await ProcessUtil.run(async () => {
    const { data, fresh } = await cache.get<Repos>('templates') || { data: [], fresh: false };

    if (fresh) {
      templates = data;
    } else return 'warn';
  }, {
    startText: 'Fetching templates from cache...',
    successText: 'Fetched templates from cache.',
    warnText: 'Cache is expired/empty.',
    failText: 'Failed to fetch templates from cache.',
  });

  if (!templates) {
    await ProcessUtil.run(async () => {
      templates = await octokit.listTemplates();

      await cache.set('templates', templates);
    }, {
      startText: 'Fetching templates...',
      successText: 'Fetched templates.',
      failText: 'Failed to fetch templates.',
    });
  }

  const options = templates!.map(({ name, description, private: isPrivate, ssh_url }) => ({
    name: `${isPrivate ? status.private : status.public} ${name}: ${description}`,
    value: ssh_url as string,
  }));

  const url = await Select.prompt({
    message: 'Select a template:',
    options,
  });

  const name = await Input.prompt('Project name:');
  if (!name) throw new Error('Project name is missing.');

  const path = join(Deno.cwd(), name);
  const exists = await FileUtil.exists(path);
  if (exists) throw new Error(`Name: ${name} already exists.`);

  await ProcessUtil.run(async () => {
    await octokit.clone(url, name);
  }, {
    startText: 'Cloning repository...',
    successText: 'Cloned repository.',
    failText: 'Failed to clone repository.',
  });

  Deno.chdir(path);

  await Deno.remove('.git', { recursive: true });

  await ProcessUtil.run(async () => {
    await NpmUtil.installPackages();
  }, {
    startText: 'Installing dependencies...',
    successText: 'Installed dependencies.',
    failText: 'Failed to install dependencies.',
  });
};

export const initCommand = new Command()
  .description('Choose a template to create a new project.')
  .action(init);
