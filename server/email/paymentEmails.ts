import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface PaymentFailedEmailData {
  email: string;
  name: string;
  amount: number;
  invoiceUrl?: string;
  reason?: string;
  subscriptionId?: string;
}

interface PaymentSucceededEmailData {
  email: string;
  name: string;
  amount: number;
  receiptUrl?: string;
  subscriptionId?: string;
}

interface SubscriptionCancelledEmailData {
  email: string;
  name: string;
  planName: string;
  endDate: Date;
  reason?: string;
}

export async function sendPaymentFailedEmail(data: PaymentFailedEmailData) {
  const { email, name, amount, invoiceUrl, reason } = data;
  
  const msg = {
    to: email,
    from: 'billing@myseniorvalet.com',
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <div class="alert">
              <strong>We were unable to process your payment of $${(amount / 100).toFixed(2)}</strong>
              ${reason ? `<br><br>Reason: ${reason}` : ''}
            </div>

            <p>To avoid any interruption to your service, please update your payment method as soon as possible.</p>

            ${invoiceUrl ? `<a href="${invoiceUrl}" class="button">Update Payment Method</a>` : ''}

            <p>If you have any questions, please contact our billing team at billing@myseniorvalet.com</p>

            <div class="footer">
              <p>Thank you for using MySeniorValet</p>
              <p style="font-size: 12px; color: #999;">The trusted platform for authentic senior living community information</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Payment failed email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending payment failed email:', error);
  }
}

export async function sendPaymentSucceededEmail(data: PaymentSucceededEmailData) {
  const { email, name, amount, receiptUrl } = data;
  
  const msg = {
    to: email,
    from: 'billing@myseniorvalet.com',
    subject: 'Payment Received - Thank You!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #7c3aed, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .success { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Received</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <div class="success">
              <strong>Your payment of $${(amount / 100).toFixed(2)} has been successfully processed.</strong>
            </div>

            <p>Thank you for your payment. Your subscription will continue without interruption.</p>

            ${receiptUrl ? `<a href="${receiptUrl}" class="button">View Receipt</a>` : ''}

            <p>If you have any questions about your payment, please contact us at billing@myseniorvalet.com</p>

            <div class="footer">
              <p>Thank you for using MySeniorValet</p>
              <p style="font-size: 12px; color: #999;">The trusted platform for authentic senior living community information</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Payment succeeded email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending payment succeeded email:', error);
  }
}

export async function sendSubscriptionCancelledEmail(data: SubscriptionCancelledEmailData) {
  const { email, name, planName, endDate, reason } = data;
  
  const msg = {
    to: email,
    from: 'billing@myseniorvalet.com',
    subject: 'Subscription Cancelled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <div class="info">
              <strong>Your ${planName} subscription has been cancelled.</strong>
              <br><br>
              Your subscription will remain active until: ${endDate.toLocaleDateString()}
              ${reason ? `<br><br>Cancellation reason: ${reason}` : ''}
            </div>

            <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription at any time.</p>

            <a href="https://myseniorvalet.com/pricing" class="button">Reactivate Subscription</a>

            <p>If you have any feedback about your experience, we'd love to hear from you at CowellandCoWebDesign@gmail.com</p>

            <div class="footer">
              <p>Thank you for using MySeniorValet</p>
              <p style="font-size: 12px; color: #999;">The trusted platform for authentic senior living community information</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Subscription cancelled email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending subscription cancelled email:', error);
  }
}

export async function sendAdminPaymentAlert(data: {
  type: 'failed' | 'disputed' | 'fraud';
  customerEmail: string;
  amount: number;
  subscriptionId?: string;
  reason?: string;
}) {
  const { type, customerEmail, amount, subscriptionId, reason } = data;
  
  const typeColors = {
    failed: '#dc2626',
    disputed: '#f59e0b',
    fraud: '#7f1d1d'
  };

  const typeLabels = {
    failed: 'Payment Failed',
    disputed: 'Payment Disputed',
    fraud: 'Fraud Alert'
  };

  const msg = {
    to: 'CowellandCoWebDesign@gmail.com',
    cc: 'william.cowell01@gmail.com',
    from: 'billing@myseniorvalet.com',
    subject: `⚠️ ${typeLabels[type]} - ${customerEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${typeColors[type]}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .details table { width: 100%; }
          .details td { padding: 8px 0; }
          .details td:first-child { font-weight: bold; width: 40%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ ${typeLabels[type]}</h1>
          </div>
          
          <div class="content">
            <p>Admin Alert: Payment issue detected</p>
            
            <div class="details">
              <table>
                <tr>
                  <td>Customer Email:</td>
                  <td>${customerEmail}</td>
                </tr>
                <tr>
                  <td>Amount:</td>
                  <td>$${(amount / 100).toFixed(2)}</td>
                </tr>
                ${subscriptionId ? `
                <tr>
                  <td>Subscription ID:</td>
                  <td>${subscriptionId}</td>
                </tr>
                ` : ''}
                ${reason ? `
                <tr>
                  <td>Reason:</td>
                  <td>${reason}</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Timestamp:</td>
                  <td>${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <p><strong>Action Required:</strong> Please review this ${type} payment issue in the admin dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Admin alert sent for ${type} payment issue`);
  } catch (error) {
    console.error('❌ Error sending admin alert:', error);
  }
}
