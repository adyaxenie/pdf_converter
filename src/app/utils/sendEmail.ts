import { SMTPClient } from 'smtp-client';

const sendEmail = async (to: string, subject: string, text: string) => {
  const client = new SMTPClient({
    host: 'smtp.mailgun.org',
    port: 587,
  });

  try {
    await client.connect();
    await client.greet({ hostname: 'supbot.io' });
    await client.authPlain({
      username: 'postmaster@supbot.io',
      password: process.env.MAILGUN_SMTP_PASSWORD!,
    });
    await client.mail({ from: 'support@supbot.io' });
    await client.rcpt({ to: to});
    await client.data(`Subject: ${subject}\n\n${text}`);
    await client.quit();
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;