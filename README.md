# Prší slyšim 

## Development

1. Install and **login** [Firebase CLI](https://firebase.google.com/docs/cli)
2. `cd functions; npm install; cd -;`
3. `scripts/start.sh`

* localhost:8008 = [Public client](http://localhost:5000)
* localhost:4000 = [Emulators UI](http://localhost:4000)

### Libraries
* [prsi](./public/library/prsi) - NPM package that has to bee keepen up to date
* [a11y-dialog-component](./public/library/a11y-dialog-component) - Accessible dialog component
* [sounts](./public/library/sounds) - Sounds library

### Database
Firebase Firestore has wide yet simple schema: `play/${perspective}/game/${gameId}` where `perspective` is
1. `private` - Complete yet private data
2. `public` - Public copy of data without sensitive data
3. `[userId]` - Copy of data including only user sensitive data and public data

Check out out [Firestore Rules](./firestore.rules)

### Contributors

| Name | Role |
|------|------|
| Daniel Hromada z [TopMonks](https://topmonks.com) | Vejvoj |
| Tomáš Franěk z [iSymbio](http://isymbio.cz) | Buzinec |
| Veronika Hallerová z [TopMonks](https://topmonks.com) | Zvukové efekty |