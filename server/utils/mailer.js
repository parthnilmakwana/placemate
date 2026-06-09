const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const gmailUser = process.env.GMAIL_USER;
const gmailClientId = process.env.GMAIL_CLIENT_ID;

const isMockEmail = !gmailUser || gmailUser === 'mock_user@gmail.com' || !gmailClientId || gmailClientId === 'mock_client_id';

let transporter = null;

if (!isMockEmail) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
    console.log('Nodemailer Gmail OAuth2 transporter initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Nodemailer OAuth2 transport:', error.message);
    console.log('Falling back to Mock Mailer Mode.');
  }
} else {
  console.log('SMTP configuration set to "mock_user" or missing. Operating in Mock Mailer Mode.');
}

/**
 * Builds a responsive, modern HTML template for the daily digest email.
 */
function compileHtmlTemplate(userName, matchedJobs) {
  // Map job items to HTML cards
  const jobCardsHtml = matchedJobs.map(job => {
    const scoreColor = job.score >= 85 ? '#10b981' : job.score >= 70 ? '#f59e0b' : '#6366f1';
    
    return `
      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155; font-family: sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h3 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 18px; font-weight: bold;">${job.title}</h3>
              <div style="color: #94a3b8; font-size: 14px; margin-bottom: 12px;">${job.company} &bull; ${job.location || 'Remote'}</div>
            </td>
            <td align="right" valign="top" style="width: 80px;">
              <div style="background-color: ${scoreColor}; color: #ffffff; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; text-align: center; display: inline-block;">
                ${job.score}% Match
              </div>
            </td>
          </tr>
        </table>
        
        <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          <strong>AI Fit Analysis:</strong><br/>
          ${job.reason}
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
          <tr>
            <td>
              <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;"><strong>MATCHED SKILLS:</strong></div>
              <div style="font-size: 13px; color: #10b981;">${job.matchedSkills ? job.matchedSkills.join(', ') : 'None'}</div>
            </td>
          </tr>
          ${job.missingSkills && job.missingSkills.length > 0 ? `
          <tr>
            <td style="padding-top: 8px;">
              <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;"><strong>SKILL GAPS TO TACKLE:</strong></div>
              <div style="font-size: 13px; color: #f43f5e;">${job.missingSkills.join(', ')}</div>
            </td>
          </tr>
          ` : ''}
        </table>

        <div style="margin-top: 16px; text-align: right;">
          <a href="${job.applyLink}" target="_blank" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block;">
            View & Apply &rarr;
          </a>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PlaceMate Daily Job Digest</title>
    </head>
    <body style="background-color: #0f172a; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
              <!-- Brand Header -->
              <tr>
                <td style="padding-bottom: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                    <span style="background: linear-gradient(135deg, #818cf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">PlaceMate</span> Agent
                  </h1>
                  <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Your Autonomous Job Search Assistant</p>
                </td>
              </tr>
              <!-- Greeting Panel -->
              <tr>
                <td style="background-color: #1e293b; border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 30px; border-bottom: 1px solid #334155;">
                  <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 20px; font-weight: bold;">Good morning, ${userName}! 👋</h2>
                  <p style="color: #cbd5e1; margin: 0; font-size: 15px; line-height: 1.6;">
                    Our background agent spent the night scraping boards and evaluating matches. We found <strong>${matchedJobs.length} potential matches</strong> for you today.
                  </p>
                  <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; font-style: italic;">
                    &bull; We have optimized and attached a tailored PDF resume custom-tailored for your #1 matching role.
                  </p>
                </td>
              </tr>
              <!-- Job List Section -->
              <tr>
                <td style="background-color: #0f172a; padding: 25px 0;">
                  <h3 style="color: #94a3b8; font-size: 13px; font-weight: 800; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 1px;">Today's Matches</h3>
                  ${jobCardsHtml}
                </td>
              </tr>
              <!-- Footer Section -->
              <tr>
                <td style="border-top: 1px solid #334155; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
                  This is an automated email digest sent daily to PlaceMate Pro subscribers.<br/>
                  To pause your agent or edit target roles, log into your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="color: #818cf8; text-decoration: none;">Dashboard</a>.<br/><br/>
                  &copy; 2026 PlaceMate Tech. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Sends the daily job match email digest.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - Recipient full name
 * @param {Array} params.matchedJobs - Array of job objects with score and reason
 * @param {Buffer} params.tailoredResumeBuffer - PDF buffer representing tailored resume
 * @returns {Promise<boolean>} - Success state
 */
async function sendJobDigestEmail({ to, userName, matchedJobs, tailoredResumeBuffer }) {
  if (!to || !userName || !matchedJobs || matchedJobs.length === 0) {
    throw new Error('Missing arguments for sending job digest email.');
  }

  const htmlContent = compileHtmlTemplate(userName, matchedJobs);
  const pdfFilename = `${userName.replace(/\s+/g, '_')}_Tailored_Resume.pdf`;

  if (isMockEmail || !transporter) {
    // Local writing path for Offline/Mock mode
    const outputLogPath = path.join(__dirname, '../tests/mock-email-log.html');
    
    // Create folders if missing
    const parentDir = path.dirname(outputLogPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(outputLogPath, htmlContent);

    console.log('==================================================');
    console.log('[MOCK EMAIL] Mailer intercepted. Simulated email details:');
    console.log(`- To: ${to}`);
    console.log(`- Subject: PlaceMate Agent: ${matchedJobs.length} New Job Matches Today!`);
    console.log(`- Attachment: ${pdfFilename} (${tailoredResumeBuffer ? tailoredResumeBuffer.length : 0} bytes)`);
    console.log(`- Saved mock HTML body to: ${outputLogPath}`);
    console.log('==================================================');

    return true;
  }

  const textContent = `Good morning, ${userName}!\n\nOur background agent spent the night scraping boards and evaluating matches. We found ${matchedJobs.length} potential matches for you today.\n\n` + 
    matchedJobs.map(job => `- ${job.title} at ${job.company} (${job.location || 'Remote'}) - Match Score: ${job.score}%\n  Reason: ${job.reason}`).join('\n\n') +
    `\n\nWe have optimized and attached a tailored PDF resume custom-tailored for your #1 matching role.\n\nTo manage your settings, visit your dashboard: ${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  try {
    const mailOptions = {
      from: `"PlaceMate Agent" <${gmailUser}>`,
      to,
      subject: `PlaceMate Agent: ${matchedJobs.length} New Job Matches Today!`,
      html: htmlContent,
      text: textContent,
      attachments: tailoredResumeBuffer ? [
        {
          filename: pdfFilename,
          content: tailoredResumeBuffer
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Email sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to deliver SMTP digest:', error);
    throw error;
  }
}

module.exports = {
  isMockEmail,
  sendJobDigestEmail
};
