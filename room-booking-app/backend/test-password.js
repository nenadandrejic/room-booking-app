const bcrypt = require('bcryptjs');

const testPassword = 'admin123';
const hashFromDB = '$2b$12$78hqu6Zg6JB8zYDXog3/Pu3G2VMatduUvSgWQJktPSzg8ejKXthQC';

bcrypt.compare(testPassword, hashFromDB, (err, result) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Password match:', result);
    }
});

// Test other user too
const testPassword2 = 'password123';
// Let's generate what the hash should be for password123
bcrypt.hash(testPassword2, 12, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
    } else {
        console.log('Hash for password123:', hash);
    }
});
