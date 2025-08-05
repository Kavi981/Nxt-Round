import nodemailer from 'nodemailer';

// Create transporter function that initializes when needed
let transporter = null;

const createTransporter = () => {
  console.log('🔧 Email Service Configuration:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL ? 'Set' : 'Not set');
  
  // Use Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    if (!transporter) {
      // Try multiple configurations for better reliability
      const configs = [
        {
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        },
        {
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }
      ];

      // Try each configuration
      for (const config of configs) {
        try {
          transporter = nodemailer.createTransport(config);
          
          // Test the connection
          transporter.verify(function(error, success) {
            if (error) {
              console.error('Email transporter verification failed:', error.message);
            } else {
              console.log('Email transporter configured successfully');
            }
          });
          
          break; // If we get here, the configuration worked
        } catch (error) {
          console.error('Failed to create transporter with config:', error.message);
          continue;
        }
      }
    }
    return transporter;
  } else {
    console.warn('Email credentials not configured. Email functionality will be disabled.');
    return null;
  }
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  console.log('Attempting to send OTP email to:', email);
  console.log('Environment variables check:');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL ? 'Set' : 'Not set');
  
  const emailService = createTransporter();
  
  if (!emailService) {
    console.error('Email transporter not configured');
    return false;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #666; margin-bottom: 20px;">
          You have requested to reset your password. Use the following OTP to create a new password:
        </p>
        <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Best regards,<br>
          The NxtRound Team
        </p>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - NxtRound',
      html: emailContent
    };

    await emailService.sendMail(mailOptions);
    console.log('OTP email sent successfully via Gmail to:', email);
    return true;
  } catch (error) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email) => {
  const emailService = createTransporter();
  
  if (!emailService) {
    console.error('Email transporter not configured');
    return false;
  }

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #d4edda; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #155724; margin-bottom: 20px;">Password Reset Successful</h2>
        <p style="color: #155724; margin-bottom: 20px;">
          Your password has been successfully reset. You can now login with your new password.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Best regards,<br>
          The NxtRound Team
        </p>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful - NxtRound',
      html: emailContent
    };

    await emailService.sendMail(mailOptions);
    console.log('Password reset success email sent via Gmail to:', email);
    return true;
  } catch (error) {
    console.error('Email sending error:', error.message);
    return false;
  }
}; 