export const template = `declare module "<%- module %>" {
    type IsAny<T> = (
      unknown extends T
        ? [keyof T] extends [never] ? false : true
        : false
    );
    type URLSearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;
    type ExportedQuery<T> = IsAny<T> extends true ? URLSearchParamsInit : T;
    type Query<T> = IsAny<T> extends true ? [URLSearchParamsInit?] : [T];
        
    export interface Routes {
    <% routes.forEach(({ path, params, queries: { module } }) => { %>
      "<%- path %>": {
        params: {
        <% params.forEach(param => { %>
          '<%- param %>': string | number;
        <% }) %>
        },
        queries: ExportedQuery<import('<%- module %>').SearchParams>,
      };
    <% }) %>
    }
    
    export function $path<
      Route extends keyof Routes,
      Rest extends {
        params: Routes[Route]["params"];
        queries?: Routes[Route]["queries"];
      }
    >(
      ...args: Rest["params"] extends Record<string, never>
        ? [route: Route, queries?: Rest["queries"]]
        : [route: Route, params: Rest["params"], queries?: Rest["queries"]]
    ): string;
  }`;
