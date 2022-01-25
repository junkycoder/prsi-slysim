/**
 * @internal
 * @param {string} key
 * @returns simple storage api
 */
const local = (key) => {
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
};

//

export const authCompleteEmailStoredLocally = local("authcompletemail");
export const playerNameStoredLocally = local("playername");
