import { Router, Request, Response } from 'express';
import { EmailService } from '../services/email';

const router = Router();

// Submit feedback endpoint
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { name, email, type, message } = req.body;

    // Validate required fields
    if (!type || !message) {
      return res.status(400).json({ 
        error: 'Feedback type and message are required' 
      });
    }

    // Format the feedback for email
    const emailHtml = `
      <h2>📧 Beta Feedback Received</h2>
      <p>A user has submitted feedback through the MySeniorValet beta form.</p>
      
      <h3>Feedback Details:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${email || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Submitted:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      
      <h3>Message:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      
      ${email ? `<p style="margin-top: 20px;"><a href="mailto:${email}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply to User</a></p>` : ''}
    `;

    // Send email to hello@myseniorvalet.com
    await EmailService.sendEmail({
      to: 'hello@myseniorvalet.com',
      subject: `Beta Feedback: ${type} - MySeniorValet`,
      html: emailHtml
    });

    console.log('Beta feedback submitted:', {
      type,
      hasName: !!name,
      hasEmail: !!email,
      messageLength: message.length
    });

    res.json({ 
      success: true, 
      message: 'Feedback submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback. Please try again.' 
    });
  }
});

export default router;