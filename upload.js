const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const readStream = fs.createReadStream('update.zip');
    const writeStream = sftp.createWriteStream('/opt/blackstone-erp/update.zip');
    writeStream.on('close', () => {
      console.log('Upload Complete');
      conn.exec('cd /opt/blackstone-erp && unzip -o update.zip && docker-compose build && docker-compose up -d', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code) => {
          console.log('Deploy Complete! code: ' + code);
          conn.end();
        }).on('data', (d) => process.stdout.write(d)).stderr.on('data', (d) => process.stderr.write(d));
      });
    });
    readStream.pipe(writeStream);
  });
}).connect({ host: '72.61.241.138', port: 22, username: 'root', password: 'Suppu123456#' });
