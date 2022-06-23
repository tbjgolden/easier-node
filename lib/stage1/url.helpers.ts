/*! Derived from sindresorhus/normalize-url | MIT */
const testParameter = (
  name: string,
  filters: ReadonlyArray<string | RegExp>
): boolean => {
  return filters.some((filter) => {
    return filter instanceof RegExp ? filter.test(name) : filter === name;
  });
};

const DATA_URL_REGEX = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/;

const normalizeDataURL = (urlString: string, { stripHash }: Options) => {
  const match = DATA_URL_REGEX.exec(urlString);

  if (!match) {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  const { type, data, hash: hash_ } = match.groups ?? {};
  const mediaType = type.split(";");
  const hash = stripHash ? "" : hash_;

  let isBase64 = false;
  if (mediaType[mediaType.length - 1] === "base64") {
    mediaType.pop();
    isBase64 = true;
  }

  // Lowercase MIME type
  const mimeType = (mediaType.shift() || "").toLowerCase();
  const attributes = mediaType
    .map((attribute) => {
      const pair = attribute.split("=").map((string) => {
        return string.trim();
      });

      // Lowercase `charset`
      if (pair[0] === "charset") {
        pair[1] = pair[1].toLowerCase();

        if (pair[1] === "us-ascii") {
          return "";
        }
      }

      return `${pair[0]}${pair[1] ? `=${pair[1]}` : ""}`;
    })
    .filter(Boolean);

  const normalizedMediaType = [...attributes];

  if (isBase64) {
    normalizedMediaType.push("base64");
  }

  if (normalizedMediaType.length > 0 || (mimeType && mimeType !== "text/plain")) {
    normalizedMediaType.unshift(mimeType);
  }

  return `data:${normalizedMediaType.join(";")},${isBase64 ? data.trim() : data}${
    hash ? `#${hash}` : ""
  }`;
};

interface Options {
  /**
   * @default 'http:'
   * Values: `'https:' | 'http:'`
   */
  readonly defaultProtocol: "https:" | "http:";

  /**
   * Normalizes `https:` URLs to `http:`.
   * @default false
   */
  readonly forceHttp: boolean;

  /**
   * Normalizes `http:` URLs to `https:`.
   * This option can't be used with the `forceHttp` option at the same time.
   * @default false
   */
  readonly forceHttps: boolean;

  /**
   * Strip the [authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) part of a URL.
   * @default true
   */
  readonly stripAuthentication: boolean;

  /**
   * Removes hash from the URL.
   * @default false
   */
  readonly stripHash: boolean;

  /**
   * Remove the protocol from the URL: `http://example.com` → `example.com`.
   * It will only remove `https://` and `http://` protocols.
   * @default false
   */
  readonly stripProtocol: boolean;

  /**
   * Strip the [text fragment](https://web.dev/text-fragments/) part of the URL
   * __Note:__ The text fragment will always be removed if the `stripHash` option is set to `true`, as the hash contains the text fragment.
   * @default true
   */
  readonly stripTextFragment: boolean;

  /**
   * Removes `www.` from the URL.
   * @default true
   */
  readonly stripWWW: boolean;

  /**
   * Removes query parameters that matches any of the provided strings or regexes.
   * @default [/^utm_\w+/i]
   */
  readonly removeQueryParameters: ReadonlyArray<RegExp | string> | boolean;

  /**
   * Removes trailing slash.
   * __Note__: Trailing slash is always removed if the URL doesn't have a pathname unless the `removeSingleSlash` option is set to `false`.
   * @default true
   */
  readonly removeTrailingSlash: boolean;

  /**
   * Remove a sole `/` pathname in the output. This option is independant of `removeTrailingSlash`.
   * @default true
   */
  readonly removeSingleSlash: boolean;

  /**
   * Removes the default directory index file from path that matches any of the provided strings or regexes.
   * When `true`, the regex `/^index\.[a-z]+$/` is used.
   * @default false
   */
  readonly removeDirectoryIndex: boolean | ReadonlyArray<RegExp | string>;

  /**
   * Sorts the query parameters alphabetically by key.
   * @default true
   */
  readonly sortQueryParameters: boolean;
}

const IS_RELATIVE_REGEX = /^\.*\//;
const RELATIVE_PROTOCOL_REGEX = /^(?!(?:\w+:)?\/\/)|^\/\//;
const TEXT_FRAGMENT_REGEX = /#?:~:text.*?$/i;
const DUPLICATE_SLASH_REGEX = /(?<!\b[a-z][\d+.a-z-]{1,50}:)\/{2,}/g;
const HAS_WWW_REGEX = /^www\.(?!www\.)[\da-z-]{1,63}\.[\d.a-z-]{2,63}$/;
const WWW_REGEX = /^www\./;
const TRAILING_DOT_REGEX = /\.$/;
const TRAILING_SLASH_REGEX = /\/$/;
const PROTOCOL_REGEX = /^(?:https?:)?\/\//;

const DEFAULT_OPTIONS: Options = {
  defaultProtocol: "http:",
  forceHttp: false,
  forceHttps: false,
  stripAuthentication: true,
  stripHash: false,
  stripTextFragment: true,
  stripWWW: true,
  stripProtocol: false,
  removeQueryParameters: [/^utm_\w+/i],
  removeTrailingSlash: true,
  removeSingleSlash: true,
  removeDirectoryIndex: false,
  sortQueryParameters: true,
};

const REMOVE_DIRECTORY_INDEX_REGEX = /^index\.[a-z]+$/;

export const normalizeURL = (urlString: string, options_: Partial<Options> = {}) => {
  const options: Options = {
    ...DEFAULT_OPTIONS,
    ...options_,
  };

  urlString = urlString.trim();

  // Data URL
  if (urlString.slice(0, 5).toLowerCase() === "data:") {
    return normalizeDataURL(urlString, options);
  }

  if (urlString.slice(0, 12).toLowerCase() === "view-source:") {
    throw new Error("`view-source:` is not supported as it is a non-standard protocol");
  }

  const hasRelativeProtocol = urlString.startsWith("//");
  const isRelativeUrl = !hasRelativeProtocol && IS_RELATIVE_REGEX.test(urlString);

  // Prepend protocol
  if (!isRelativeUrl) {
    urlString = urlString.replace(RELATIVE_PROTOCOL_REGEX, options.defaultProtocol);
  }

  const urlObject = new URL(urlString);

  if (options.forceHttp && options.forceHttps) {
    throw new Error("The `forceHttp` and `forceHttps` options cannot be used together");
  }

  if (options.forceHttp && urlObject.protocol === "https:") {
    urlObject.protocol = "http:";
  }

  if (options.forceHttps && urlObject.protocol === "http:") {
    urlObject.protocol = "https:";
  }

  // Remove auth
  if (options.stripAuthentication) {
    urlObject.username = "";
    urlObject.password = "";
  }

  // Remove hash
  if (options.stripHash) {
    urlObject.hash = "";
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(TEXT_FRAGMENT_REGEX, "");
  }

  // Remove duplicate slashes if not preceded by a protocol
  // NOTE: This could be implemented using a single negative lookbehind
  // regex, but we avoid that to maintain compatibility with older js engines
  // which do not have support for that feature.
  if (urlObject.pathname) {
    urlObject.pathname = urlObject.pathname.replace(DUPLICATE_SLASH_REGEX, "/");
  }

  // Decode URI octets
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname);
    } catch {
      //
    }
  }

  // Remove directory index
  const removeDirectoryIndex =
    typeof options.removeDirectoryIndex === "boolean"
      ? options.removeDirectoryIndex
        ? [REMOVE_DIRECTORY_INDEX_REGEX]
        : []
      : options.removeDirectoryIndex;

  if (Array.isArray(removeDirectoryIndex) && removeDirectoryIndex.length > 0) {
    let pathComponents = urlObject.pathname.split("/");
    const lastComponent = pathComponents[pathComponents.length - 1];

    if (testParameter(lastComponent, removeDirectoryIndex)) {
      pathComponents = pathComponents.slice(0, -1);
      urlObject.pathname = pathComponents.slice(1).join("/") + "/";
    }
  }

  if (urlObject.hostname) {
    urlObject.hostname = urlObject.hostname.replace(TRAILING_DOT_REGEX, "");

    // Remove `www.`
    if (options.stripWWW && HAS_WWW_REGEX.test(urlObject.hostname)) {
      // Each label should be max 63 at length (min: 1).
      // Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
      // Each TLD should be up to 63 characters long (min: 2).
      // It is technically possible to have a single character TLD, but none currently exist.
      urlObject.hostname = urlObject.hostname.replace(WWW_REGEX, "");
    }
  }

  // Remove query unwanted parameters
  if (Array.isArray(options.removeQueryParameters)) {
    // eslint-disable-next-line unicorn/no-useless-spread -- We are intentionally spreading to get a copy.
    for (const key of [...urlObject.searchParams.keys()]) {
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams.delete(key);
      }
    }
  }

  if (options.removeQueryParameters === true) {
    urlObject.search = "";
  }

  // Sort query parameters
  if (options.sortQueryParameters) {
    urlObject.searchParams.sort();

    // Calling `.sort()` encodes the search parameters, so we need to decode them again.
    try {
      urlObject.search = decodeURIComponent(urlObject.search);
    } catch {
      //
    }
  }

  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(TRAILING_SLASH_REGEX, "");
  }

  const oldUrlString = urlString;

  // Take advantage of many of the Node `url` normalizations
  urlString = urlObject.toString();

  if (
    !options.removeSingleSlash &&
    urlObject.pathname === "/" &&
    !oldUrlString.endsWith("/") &&
    urlObject.hash === ""
  ) {
    urlString = urlString.replace(TRAILING_SLASH_REGEX, "");
  }

  // Remove ending `/` unless removeSingleSlash is false
  if (
    (options.removeTrailingSlash || urlObject.pathname === "/") &&
    urlObject.hash === "" &&
    options.removeSingleSlash
  ) {
    urlString = urlString.replace(TRAILING_SLASH_REGEX, "");
  }

  // Remove http/https
  if (options.stripProtocol) {
    urlString = urlString.replace(PROTOCOL_REGEX, "");
  }

  return urlString;
};
