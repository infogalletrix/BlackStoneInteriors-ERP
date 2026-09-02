const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`docker exec -i blackstone_db mysql -ublackstone_user -pStrongPassword123! black_stone_interiors_erp -e "UPDATE AdminUsers SET Password = 'admin123' WHERE Username = 'admin';"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Update Complete! code: ' + code);
      conn.end();
    }).on('data', (d) => console.log('STDOUT: ' + d)).stderr.on('data', (d) => console.log('STDERR: ' + d));
  });
}).connect({ host: '72.61.241.138', port: 22, username: 'root', password: 'Suppu123456#' });
