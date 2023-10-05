function includesParams(route: string) {
  return route.indexOf("/:") > -1;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $path(route: string, ...paramsOrQuery: Array<any>) {
  let path = route;
  let query:
    | string
    | [string, string][]
    | Record<string, string>
    | URLSearchParams
    | undefined = paramsOrQuery[0];

  if (includesParams(route)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = paramsOrQuery[0];
    query = paramsOrQuery[1];
    path = route
      .split("/")
      .map((fragment) => {
        if (fragment.indexOf(":") > -1) {
          let paramName = fragment.slice(1);
          if (paramName.indexOf("?") > -1) {
            paramName = paramName.slice(0, -1);
          }
          if (paramName in params) {
            return params[paramName];
          }
          return null;
        }
        return fragment;
      })
      .filter((f) => f !== null)
      .join("/");
  }

  if (!query) {
    return path;
  }

  const searchParams = new URLSearchParams(query);

  return path + "?" + searchParams.toString();
}
