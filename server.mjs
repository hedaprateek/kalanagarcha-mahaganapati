import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startEditorServer } from './editor/server.mjs';

startEditorServer({
  root: dirname(fileURLToPath(import.meta.url)),
  port: Number(process.argv.slice(2).find(argument => argument !== '--edit') || 8791),
  variable: 'MANDAL_CONFIG',
  defaultPublishing: { owner: 'hedaprateek', repository: 'kalanagarcha-mahaganapati', branch: 'main' },
  openEditor: process.argv.includes('--edit'),
});
