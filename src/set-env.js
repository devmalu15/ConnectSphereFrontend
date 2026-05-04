const fs = require('fs');
const path = require('path');

const envDirectory = path.join(__dirname, 'environments');

// Ensure the directory exists
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory);
}

const targetPath = path.join(envDirectory, 'environment.ts');
const prodPath = path.join(envDirectory, 'environment.prod.ts');

const envConfigFile = `export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  apiUrl: '${process.env.API_URL || 'http://localhost:5096'}',
  adminApiUrl: '${process.env.ADMIN_API_URL || 'http://localhost:5158'}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || '442147865-tcjlq2ujfboe2elrtpol7k1sn06lc725.apps.googleusercontent.com'}'
};
`;

console.log('Generating environment files...');
fs.writeFileSync(targetPath, envConfigFile);
fs.writeFileSync(prodPath, envConfigFile);
console.log(`Environment files generated at ${targetPath}`);
