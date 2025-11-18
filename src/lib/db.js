import { init, tx, id } from '@instantdb/react';

const APP_ID = '2ef221e3-f9b0-4bd8-a77d-fbaca46456c8';

export const db = init({
  appId: APP_ID,
  devtool: false,
});

export { tx, id };

