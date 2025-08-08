/**
 * Netlify Function to process the contact form and send an email using SendGrid.
 *
 * When the form on `contact.html` is submitted, the browser posts the form
 * fields directly to this function endpoint (`/.netlify/functions/send-email`).
 * The function parses the encoded form data, optionally filters out spam
 * submissions based on a hidden honeypot field, and then uses the SendGrid
 * HTTP API to send an email to the configured recipient. Finally, it
 * redirects the user to a friendly success page. To configure this
 * function, set the following environment variables in your Netlify site:
 *
 *   SENDGRID_API_KEY – Your SendGrid API key (required)
 *   TO_EMAIL        – The email address that should receive the form data
 *                      (defaults to `jietong.fu@gmail.com` if not provided)
 *   FROM_EMAIL      – The sender address to use when sending the email
 *                      (defaults to the address supplied by the form)
 */

const https = require('https');

/**
 * Parse a URL‑encoded string into a key/value object. This helper handles
 * simple form submissions of the `application/x-www-form-urlencoded` type.
 *
 * @param {string} body The raw request body
 * @returns {object} A plain object containing the parsed fields
 */
function parseFormBody(body) {
  const params = new URLSearchParams(body);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Send an email using the SendGrid API.
 *
 * @param {string} apiKey Your SendGrid API key
 * @param {string} to The recipient email address
 * @param {string} from The sender email address
 * @param {string} subject The subject of the email
 * @param {string} text The plain‑text body of the email
 * @returns {Promise<void>} Resolves when the API call completes
 */
function sendEmailViaSendGrid(apiKey, to, from, subject, text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: from },
      content: [
        {
          type: 'text/plain',
          value: text,
        },
      ],
    });

    const options = {
      hostname: 'api.sendgrid.com',
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      // Consume response to free up memory; we don't need the body.
      res.on('data', () => {});
      res.on('end', () => {
        // Consider 202 (Accepted) as success according to SendGrid docs.
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`SendGrid API responded with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  // Only allow POST requests to this endpoint.
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: 'Method Not Allowed',
    };
  }

  // Parse the incoming form body. Netlify delivers the body as a string.
  const formData = parseFormBody(event.body || '');

  // Simple spam prevention: check the hidden honeypot field. If it has
  // content, assume this submission is from a bot and silently succeed.
  if (formData['bot-field']) {
    return {
      statusCode: 302,
      headers: {
        Location: '/contact-success.html',
      },
      body: '',
    };
  }

  const name = formData.name || 'No name provided';
  const email = formData.email || 'no‑reply@example.com';
  const service = formData.service || 'General Inquiry';
  const message = formData.message || '';

  const sgApiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.TO_EMAIL || 'jietong.fu@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || email;

  // Construct the email content.
  const subject = `New message from ${name}`;
  const text =
    `You have received a new message from your website contact form.\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Inquiry Type: ${service}\n\n` +
    `Message:\n${message}\n`;

  try {
    if (!sgApiKey) {
      throw new Error('SendGrid API key is not configured (SENDGRID_API_KEY).');
    }
    await sendEmailViaSendGrid(sgApiKey, toEmail, fromEmail, subject, text);
  } catch (err) {
    console.error('Error sending email:', err);
    // Return a 500 error so Netlify logs capture the failure. The user is
    // still redirected to the success page to avoid exposing error details.
    return {
      statusCode: 500,
      body: `Error sending email: ${err.message}`,
    };
  }

  // Redirect the client to a thank you page once the email has been sent.
  return {
    statusCode: 302,
    headers: {
      Location: '/contact-success.html',
    },
    body: '',
  };
};