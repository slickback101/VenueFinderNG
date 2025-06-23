const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
    }
});
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
    try {
    const transporter = createTransporter();
    
    const mailOptions = {
    from: `"VenueFinderNG" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Welcome to VenueFinderNG!',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2c3e50;">Welcome to VenueFinderNG, ${userName}!</h2>
    <p>Thank you for joining our platform. We're excited to help you discover amazing venues across Nigeria.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>What you can do with VenueFinderNG:</h3>
            <ul>
    <li>Search and discover venues near you</li>
    <li>Read and write venue reviews</li>
    <li>Save your favorite venues</li>
    <li>Get notified about events and updates</li>
            </ul>
    </div>
    <p>Get started by exploring venues in your area!</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
    style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Explore Venues
    </a>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #7f8c8d; font-size: 12px;">
            If you have any questions, feel free to contact our support team.
    </p>
        </div>
    `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
    }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
    try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
    from: `"VenueFinderNG Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Password Reset Request - VenueFinderNG',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #e74c3c;">Password Reset Request</h2>
    <p>Hello ${userName},</p>
    <p>We received a request to reset your password for your VenueFinderNG account.</p>
    <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
            <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
    </div>
    <p>To reset your password, click the button below:</p>
    <a href="${resetUrl}" 
    style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
            Reset Password
    </a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #3498db;">${resetUrl}</p>
    <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #7f8c8d; font-size: 12px;">
            If you continue to have problems, please contact our support team.
    </p>
        </div>
    `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
    }
};

// Send email verification
const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
    try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
    from: `"VenueFinderNG" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Verify Your Email - VenueFinderNG',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Verify Your Email Address</h2>
    <p>Hello ${userName},</p>
    <p>Thank you for signing up with VenueFinderNG! To complete your registration, please verify your email address.</p>
    <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
    style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
    Verify Email Address
            </a>
    </div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #3498db;">${verificationUrl}</p>
    <p><strong>This verification link will expire in 24 hours.</strong></p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #7f8c8d; font-size: 12px;">
            If you didn't create an account with VenueFinderNG, please ignore this email.
    </p>
        </div>
    `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
    }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
    try {
    const transporter = createTransporter();
    
    const mailOptions = {
    from: `"VenueFinderNG Bookings" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Confirmation - ${bookingDetails.venueName}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #27ae60;">Booking Confirmed!</h2>
    <p>Hello ${userName},</p>
    <p>Your booking has been confirmed. Here are the details:</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">Booking Details</h3>
            <p><strong>Venue:</strong> ${bookingDetails.venueName}</p>
            <p><strong>Date:</strong> ${bookingDetails.date}</p>
            <p><strong>Time:</strong> ${bookingDetails.time}</p>
            <p><strong>Duration:</strong> ${bookingDetails.duration}</p>
            <p><strong>Number of Guests:</strong> ${bookingDetails.guests}</p>
            <p><strong>Total Amount:</strong> ₦${bookingDetails.totalAmount}</p>
            <p><strong>Booking Reference:</strong> ${bookingDetails.reference}</p>
    </div>

    <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
            <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time.</p>
    </div>

    <p>If you need to make any changes to your booking, please contact us as soon as possible.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #7f8c8d; font-size: 12px;">
            Questions? Contact us at ${process.env.SUPPORT_EMAIL || 'support@venuefinderng.com'}
    </p>
        </div>
    `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw new Error('Failed to send booking confirmation email');
    }
};