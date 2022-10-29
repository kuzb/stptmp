import FileUtil from '/utils/FileUtil.ts';
import DevelopmentError from '/libs/DevelopmentError.ts';

class PackageUtil {
  static async installPackages() {
    const hasNpm = await FileUtil.exists('package-lock.json');
    const hasYarn = await FileUtil.exists('yarn.lock');

    if (hasNpm) await PackageUtil.npmInstall();
    else if (hasYarn) await PackageUtil.yarnInstall();
    else throw new DevelopmentError('No package manager found.');
  }

  private static async npmInstall() {
    const process = Deno.run({
      cmd: ['npm', 'install'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new DevelopmentError(new TextDecoder().decode(await process.stderrOutput()));
  }

  private static async yarnInstall() {
    const process = Deno.run({
      cmd: ['yarn', 'install'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code } = await process.status();

    if (code !== 0) throw new DevelopmentError(new TextDecoder().decode(await process.stderrOutput()));
  }
}

export default PackageUtil;
