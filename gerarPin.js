const bcrypt = require('bcrypt');

(async () => {
  const pin = ' 240198'; // PIN desejado
  const hash = await bcrypt.hash(pin, 10);
  console.log('PIN:', pin);
  console.log('HASH:', hash);
})();
