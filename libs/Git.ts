import { Octokit as OctokitCore, RestEndpointMethodTypes } from 'octokit';

import ExecUtil from '/utils/ExecUtil.ts';

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
    await ExecUtil.single(['git', 'clone', url, name]);
  }

  async init(): Promise<void> {
    await ExecUtil.sequence([
      ['git', 'init'],
      ['git', 'add', '.'],
      ['git', 'commit', '-m', '"chore: initial commit"'],
    ]);
  }
}

export default Git;
