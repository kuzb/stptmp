import { Octokit as OctokitCore, RestEndpointMethodTypes } from 'octokit';

import DevelopmentError from '/libs/DevelopmentError.ts';

export type Repos = RestEndpointMethodTypes['repos']['listForUser']['response']['data'];

class Git extends OctokitCore {
  private page_size = 30;

  async listTemplates(): Promise<Repos> {
    const repos = [] as Repos;

    while (true) {
      const { data } = await this.request('GET /user/repos', {
        page: repos.length / this.page_size + 1,
        per_page: this.page_size,
      });

      repos.push(...data);

      if (data.length < this.page_size) break;
    }

    return repos.filter(({ is_template, name }) => is_template || name.match(/template/i));
  }

  async clone(url: string, name: string): Promise<void> {
    const process = Deno.run({
      cmd: ['git', 'clone', url, name],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new DevelopmentError(new TextDecoder().decode(await process.stderrOutput()));
  }
}

export default Git;
