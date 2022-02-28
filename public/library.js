/**
 * Parse URL param using URLPattern (thx https://web.dev/urlpattern/).
 *
 * @param {string} paramName
 * @param {string} url  defaults to location.href in the time of execution
 */
export const parseUrlParam = (paramName, url) => {
  if (!url) url = window.location.href;
  const u = new URL(url);
  const s = u.pathname.split("/");
  const i = s.findIndex((slug, index, list) => slug === paramName);
  return i > -1 ? s[i + 1] : null;
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
  str
    .split(sep)
    .map((s, i) => (!i ? s : toCapitalized(s)))
    .join("");

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
    let value = formData.get(key);
    if (value === "on") value = true;
    payload[camelCase ? toCamelCase(key) : key] = value;
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

/**
 * Deep merge objects.
 * @param {Object} target Target object
 * @param {Object} source Source object
 * @returns {Object}
 */
export const deepMerge = (target, source) => {
  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (
      targetValue &&
      Array.isArray(targetValue) &&
      Array.isArray(sourceValue)
    ) {
      // hotifix for non propagating array changes,
      //  array item references are now BROKEN
      target[key] = sourceValue;
    } else if (
      targetValue &&
      typeof targetValue === "object" &&
      typeof sourceValue === "object"
    ) {
      target[key] = deepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
};
