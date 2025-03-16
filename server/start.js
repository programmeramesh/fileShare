import { exec } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Start the server
console.log('Starting server...');
const server = exec('npm start', { cwd: __dirname });

server.stdout.on('data', (data) => {
    console.log(data);
});

server.stderr.on('data', (data) => {
    console.error(data);
});
