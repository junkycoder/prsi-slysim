const factory = (fn) => fn();

/**
 *
 * @returns
 */
export const authCompleteEmailStoredLocally = factory(() => {
  const key = "authcompletemail";
  let value;

  return {
    read: () => {
      if (!value) {
        value = window.localStorage.getItem(key);
      }
      return value;
    },
    write: (email) => {
      window.localStorage.setItem(key, email);
      value = email;
    },
    remove: () => {
      window.localStorage.removeItem(key);
      value = undefined;
    },
  };
});
