import program from "commander";
import {writeDependencies} from "./dependencies.js";
import {error, print} from "./io.js";
import {writeLicenses} from "./licenses.js";
import {getSelfPackage} from "./selfpackage.js";

const main = async () => {
  const pkg = await getSelfPackage();
  program.version(pkg.version);
  program.name("dependencies-summary");
  program.description("Ouptut all the licenses and dependencies "
    + "used in a node project");
  program.option(
    "-l, --libraries <path>",
    "Output file for dependencies listing",
    "dependencies.md",
  );
  program.option(
    "-p, --production <path>",
    "Output file for production dependencies",
    "licenses.production.md",
  );
  program.option(
    "-d, --development <path>",
    "Output file for development dependencies",
    "licenses.development.md",
  );
  program.parse(process.argv);
  const options = program.opts();
  print(`Listing output path: ${options.libraries as string}`);
  print(`Production output path: ${options.production as string}`);
  print(`Development output path: ${options.development as string}`);
  return Promise.all([
    writeDependencies(".", options.libraries as string),
    writeLicenses(".", options.production as string, true),
    writeLicenses(".", options.development as string, false),
  ]);
};
main().catch(e => error(e));
