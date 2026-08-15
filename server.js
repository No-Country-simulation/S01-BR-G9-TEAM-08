/**
 * FinGuardian AI - Root Server Entrypoint
 * Executa o servidor a partir da pasta raiz ou da pasta Frontend.
 */

const path = require('path');
process.chdir(path.join(__dirname, 'Frontend'));
require('./Frontend/server.js');
