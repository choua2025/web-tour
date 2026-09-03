import 'dotenv/config';
import { transporter } from '../utils/email.js';

// Standalone SMTP check, so a mail problem can be told apart from an API
// problem without walking through the whole forgot-password flow.
//   npm run check:mail
const pass = process.env.MAIL_PASS || '';
const stripped = pass.replace(/\s/g, '');

console.log('SMTP target :', `${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`);
console.log('Account     :', process.env.MAIL_USER);
console.log('Secret      :', stripped.length, 'chars (spaces stripped)');

if (!process.env.MAIL_USER || !pass) {
    console.error('\n❌ MAIL_USER or MAIL_PASS is missing from .env');
    process.exit(1);
}

if (process.env.MAIL_HOST === 'smtp.gmail.com' && !/^[a-z]{16}$/.test(stripped)) {
    console.warn('\n⚠️  That does not look like a Gmail App Password (16 lowercase letters).');
    console.warn('   A normal account password will always be rejected by Gmail SMTP.');
}

try {
    await transporter.verify();
    console.log('\n✅ SMTP credentials accepted — forgot-password can send mail.');
    process.exit(0);
} catch (error) {
    console.error('\n❌ SMTP rejected the credentials:\n  ', error.message.split('\n')[0]);

    if (String(error.message).includes('535')) {
        console.error('\n   Gmail returns 535 when the App Password was revoked, belongs to a');
        console.error('   different account, or 2-Step Verification was switched off (which');
        console.error('   invalidates every App Password at once).');
        console.error('\n   Fix: myaccount.google.com → Security → 2-Step Verification → App passwords');
        console.error('        Generate a new one, then put it in .env as MAIL_PASS.');
    }
    process.exit(1);
}
