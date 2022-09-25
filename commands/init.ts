import { Command, Input, Select } from 'cliffy';
import { join } from 'std/path';

import Git, { Repos } from '/libs/Git.ts';
import ProcessUtil from '/utils/ProcessUtil.ts';
import FileUtil from '/utils/FileUtil.ts';
import NpmUtil from '/utils/NpmUtil.ts';

const status = {
  public: '',
  private: '',
};

const init = async () => {
  const octokit = new Git({ auth: Deno.env.get('GITHUB_PACKAGES_TOKEN') });

  let templates: Repos;

  await ProcessUtil.run(async () => {
    templates = await octokit.listTemplates();
  }, {
    startText: 'Fetching templates...',
    successText: 'Fetched templates.',
    failText: 'Failed to fetch templates.',
  });

  const options = templates!.map(({ name, description, private: isPrivate, ssh_url }) => ({
    name: `${isPrivate ? status.private : status.public} ${name}: ${description}`,
    value: ssh_url as string,
  }));

  const url = await Select.prompt({
    message: 'Select a template:',
    options,
  });

  const name = await Input.prompt('Project name:');
  const path = join(Deno.cwd(), name);

  const exists = await FileUtil.exists(path);
  if (exists) throw new Error(`${name} already exists`);

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