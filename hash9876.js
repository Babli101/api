// hash9876.js
const bcrypt = require('bcryptjs'); // agar bcryptjs installed nahi to `npm install bcryptjs`
(async () => {
  const plain = '9876';
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);
  console.log('Plain:', plain);
  console.log('Hash :', hash);
})();
