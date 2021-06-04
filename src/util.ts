import {readFile} from "fs/promises";
import {promisify} from "util";
import checker, {Data, InitCB, InitOptions} from "license-checker-rseidelsohn";

export const readJSON = async <T>(path: string): Promise<T> => {
  const fileContent = await readFile(path, "utf8");
  return JSON.parse(fileContent) as T;
};

/** Promise-based license-checker */
export const pCheck = promisify((opt: InitOptions, cb: InitCB) => checker.init(opt, cb));

export interface PackageLite {
  name: string;
  version: string;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
}

export const getCurrentPackage = (): Promise<PackageLite> => readJSON<PackageLite>("package.json");

/**
 * List name of dependencies for production/development
 *
 * @param production
 * List only production dependencies if true, only development dependencies if
 * false.
 *
 * @return
 * List of dependencies
 */
export const getDependencies = async (
  production: boolean,
): Promise<Array<string>> => {
  const pkg = await getCurrentPackage();
  const listSource = production
    ? pkg.dependencies
    : pkg.devDependencies;
  return Object.keys(listSource ?? {});
};

/**
 * Return only the packages that match the provided list
 *
 * @param checkerOutput
 * The output of license-checker
 *
 * @param packageNames
 * The name of packages to look for
 *
 * @return
 * An object similar to checkerOutput but with only the requested packages
 */
export const filterPackages = (
  checkerOutput: Data,
  packageNames: Array<string>,
): Data => Object.keys(checkerOutput).reduce<Data>(
  (result, packageWithVersion) => {
    const packageWithoutVersion = packageWithVersion.slice(
      0,
      packageWithVersion.lastIndexOf("@"),
    );
    if (packageNames.includes(packageWithoutVersion)) {
      result[packageWithVersion] = checkerOutput[packageWithVersion];
    }
    return result;
  },
  {},
);

/**
 * Return the name provided in package.json
 *
 * @return
 * Name (with @version)
 */
export const selfName = async (): Promise<string> => {
  const pkg = await getCurrentPackage();
  return `${pkg.name}@${pkg.version}`;
};
