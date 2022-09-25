import { dirname, join } from 'std/path';

import FileUtil from '/utils/FileUtil.ts';

const WEEK = 1000 * 60 * 60 * 24 * 7;

interface CacheFile {
  [key: string]: {
    data: Record<string, any>;
    date: string;
  };
}

interface CacheData<T extends Record<string, any>> {
  data: T;
  fresh: boolean;
}

class Cache {
  private filePath: string;

  constructor() {
    const platform = Deno.build.os;

    if (platform === 'darwin' || platform === 'linux') {
      this.filePath = join(Deno.env.get('HOME')!, '.cache', 'stptmp', 'cache.json');

      Deno.mkdirSync(dirname(this.filePath), { recursive: true });

      if (!FileUtil.existsSync(this.filePath)) Deno.writeTextFileSync(this.filePath, '{}');
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  public async get<T>(key: string): Promise<CacheData<T> | undefined> {
    const file = await Deno.readTextFile(this.filePath);
    const parsed = JSON.parse(file) as CacheFile;

    if (parsed[key]) {
      const cache = {
        data: parsed[key].data as T,
        fresh: Date.now() - new Date(parsed[key].date).getTime() < WEEK,
      };

      return cache as CacheData<T>;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const file = await Deno.readTextFile(this.filePath);
    const parsed = JSON.parse(file) as CacheFile;

    parsed[key] = {
      data: value,
      date: new Date().toISOString(),
    };

    parsed[key].data = value;

    await Deno.writeTextFile(this.filePath, JSON.stringify(parsed));
  }
}

export default Cache;
