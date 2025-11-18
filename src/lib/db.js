import { init, tx, id } from '@instantdb/react';

const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID;

if (!APP_ID) {
  throw new Error('VITE_INSTANTDB_APP_ID is not defined in environment variables');
}

export const db = init({
  appId: APP_ID,
  devtool: false,
});

export { tx, id };
