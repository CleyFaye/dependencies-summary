import program from "commander";
import pkg from "../package";
import outputDependencies from "./dependencies";
import {error, print} from "./io";
import outputLicenses from "./licenses";

const main = () => {
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
  print(`Listing output path: ${options.libraries}`);
  print(`Production output path: ${options.production}`);
  print(`Development output path: ${options.development}`);
  return Promise.all([
    outputDependencies(options.libraries),
    outputLicenses(options.production, true),
    outputLicenses(options.development, false),
  ]);
};
main().catch(e => error(e));
