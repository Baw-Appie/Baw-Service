const dns = require('dns');
  dns.resolve('_minecraft._tcp.rpgfa2rm.com', 'SRV', (err, records) => {
    try {
      if (err) throw err;
      console.log(records);
    } catch(e) {
      console.log('오류데스' + e.message)
    }
  });
