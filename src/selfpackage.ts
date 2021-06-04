import {readJSON, PackageLite} from "./util.js";
import {
  dirname,
  join,
} from "path";
import {fileURLToPath} from "url";

const selfPath = dirname(fileURLToPath(import.meta.url));

/** Return the content of this (dependencies-summary) project package.json */
export const getSelfPackage = (): Promise<PackageLite> => readJSON(join(
  selfPath,
  "..",
  "package.json",
));
