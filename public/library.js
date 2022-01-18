/**
 * Parse URL param using URLPattern (thx https://web.dev/urlpattern/).
 *
 * @param {string} paramName
 * @param {string} url  defaults to location.href in the time of execution
 */
export const parseUrlParam = (paramName, url) => {
  if (!url) url = window.location.href;

  const u = new URL(url);
  const p = new URLPattern({
    pathname: "/game/:gameId",
    protocol: u.protocol,
    hostname: u.hostname,
  });

  if (p.test(url)) {
    return p.exec(url).pathname.groups[paramName];
  }
};
