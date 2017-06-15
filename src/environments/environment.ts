// The file contents for the current environment will overwriten during build.
// The build system defaults to the dev environment which uses `environment.ts`,
// but if you do `ng build --env=prod` then `environment.prod.ts` will be used
// instead. The list of which env maps to which file can be found in
// `.angular-cli.json`.

export const environment = {
  production: false,
  appName: 'OPTION QUOTE',
  firebase: {
    apiKey: 'AIzaSyDag5F7YBQvJeRqmQgxH9WfojgG8Qrz9DU',
    authDomain: 'options-54580.firebaseapp.com',
    databaseURL: 'https://options-54580.firebaseio.com',
    projectId: 'options-54580',
    storageBucket: 'options-54580.appspot.com',
    messagingSenderId: '574922059308'
  }
};
