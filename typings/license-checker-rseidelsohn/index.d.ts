declare module "license-checker-rseidelsohn" {
  export interface InitOptions {
    start: string;
    production?: boolean;
    development?: boolean;
    excludePackages?: Array<string>;
    customPath?: {
      description?: string | null;
      publisher?: string | null;
      url?: string | null;
      licenses?: string | null;
      licenseFile?: string | null;
      licenseText?: string | null;
    }
  }

  export interface DepInfo {
    licenses?: string;
    description?: string;
    url?: string;
    publisher?: string;
    licenseFile?: string;
    licenseText?: string;
  }

  export type Data = Record<string, DepInfo>;

  export type InitCB = (err: unknown, data: Data) => void;

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  export default class Checker {
    public static init: (
      opt: InitOptions,
      cb: InitCB,
    ) => void;
  }
}
