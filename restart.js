const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('docker restart blackstone_backend', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Restart Complete! code: ' + code);
      conn.end();
    });
  });
}).connect({ host: '72.61.241.138', port: 22, username: 'root', password: 'Suppu123456#' });
