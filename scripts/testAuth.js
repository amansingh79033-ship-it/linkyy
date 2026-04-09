import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('=== Testing .env.local Parsing ===\n');
console.log('ADMIN_USERNAME:', JSON.stringify(process.env.ADMIN_USERNAME));
console.log('ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));
console.log('\nLength checks:');
console.log('ADMIN_USERNAME length:', process.env.ADMIN_USERNAME?.length);
console.log('ADMIN_PASSWORD length:', process.env.ADMIN_PASSWORD?.length);
console.log('\nCharacter codes:');
console.log('ADMIN_USERNAME first char code:', process.env.ADMIN_USERNAME?.charCodeAt(0));
console.log('ADMIN_PASSWORD first char code:', process.env.ADMIN_PASSWORD?.charCodeAt(0));

// Test authentication
const testUsername = 'Addy';
const testPassword = 'Password12';

console.log('\n=== Authentication Test ===\n');
console.log('Expected username:', JSON.stringify(testUsername));
console.log('Expected password:', JSON.stringify(testPassword));
console.log('Username matches:', process.env.ADMIN_USERNAME === testUsername);
console.log('Password matches:', process.env.ADMIN_PASSWORD === testPassword);
