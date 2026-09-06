declare module "html-minifier-terser" {
  export interface Options {
    caseSensitive?: boolean;
    collapseWhitespace?: boolean;
    conservativeCollapse?: boolean;
    ignoreCustomComments?: readonly RegExp[];
    minifyCSS?: boolean | ((value: string, type?: string) => string | Promise<string>);
    minifyJS?: boolean | ((value: string, inline?: boolean) => string | Promise<string>);
    removeComments?: boolean;
    removeRedundantAttributes?: boolean;
    useShortDoctype?: boolean;
  }

  export function minify(value: string, options?: Options): Promise<string>;
}

declare module "clean-css" {
  export interface Output {
    styles: string;
    errors: string[];
    warnings: string[];
  }

  export default class CleanCss {
    minify(value: string): Output;
  }
}
