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

/**
 * Capitalize first letter of give string.
 * @param {string} str
 * @returns {string}
 */
export const toCapitalized = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Transform text to camel case style.
 * @param {string} str String for
 * @param {string} sep Word separator. Defaults to "-"
 * @returns
 */
export const toCamelCase = (str, sep = "-") =>
  str.split(sep).map(toCapitalized).join();

/**
 * Serialize form data to basic payload object.
 *
 * @param {FormData} formData
 * @param {Object} options `camelCase: false` will skip key name transformation
 * @returns
 */
export const formDataToPayload = (formData, { camelCase = true } = {}) => {
  let payload = {};

  for (let key of formData.keys()) {
    payload[camelCase ? toCamelCase(key) : key] = formData.get(key);
  }

  return payload;
};

/**
 * Walks through all URL search params,
 *  search for relevant input and sets it's value.
 *
 * @param {*} formElement Required form element DOM reference
 * @param {*} location Insert the location you want to use to search for parameters
 *                       or leave blank for use current one
 */
export const searchParamsToFormValues = (formElement, { search } = {}) => {
  if (!search) search = window.location.search;
  const params = new URLSearchParams(search);

  for (let key of params.keys()) {
    const inputElement = formElement.querySelector(`[name="${key}"]`);

    if (inputElement) {
      inputElement.value = params.get(key);
    }
  }
};
