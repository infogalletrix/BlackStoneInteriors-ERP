const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find / -name "docker-compose.yml" -type f 2>/dev/null', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', (d) => console.log('STDOUT: ' + d)).stderr.on('data', (d) => console.log('STDERR: ' + d));
  });
}).connect({ host: '72.61.241.138', port: 22, username: 'root', password: 'Suppu123456#' });
