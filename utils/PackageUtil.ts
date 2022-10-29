import FileUtil from '/utils/FileUtil.ts';
import ExecUtil from '/utils/ExecUtil.ts';
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
    await ExecUtil.single(['npm', 'install']);
  }

  private static async yarnInstall() {
    await ExecUtil.single(['yarn', 'install']);
  }
}

export default PackageUtil;
