import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log(`Sending email to ${params.to}: ${params.subject}`);
    
    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || params.text || ''
    };

    const [response] = await sgMail.send(msg);
    
    console.log(`Email sent successfully. Status: ${response.statusCode}`);
    return response.statusCode >= 200 && response.statusCode < 300;

  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
}

// Super admin notification specifically
export async function notifySuperAdmin(title: string, message: string, data?: any) {
  return await sendEmail({
    to: 'William.cowell01@gmail.com',
    from: 'hello@myseniorvalet.com',
    subject: `MySeniorValet Alert: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">${title}</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${message}</p>
          ${data ? `<pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>` : ''}
        </div>
        <p style="color: #6b7280; font-size: 12px;">MySeniorValet System - ${new Date().toLocaleString()}</p>
      </div>
    `,
    text: `${title}\n\n${message}\n\n${data ? JSON.stringify(data, null, 2) : ''}`
  });
}