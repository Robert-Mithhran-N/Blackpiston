import nodemailer from "nodemailer";

// Create a transporter instance using generic SMTP or a service like Resend/Sendgrid
// We use fallback to a dummy ethereal test account if no real creds exist
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SENDER_EMAIL = process.env.SENDER_EMAIL || '"BlackPiston Garage" <noreply@blackpistongarage.com>';

/**
 * Core interface for sending any email
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    return false;
  }
};

/**
 * Specialized Email Templates
 */

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const subject = "Welcome to BlackPiston Garage!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff3333;">Welcome to BlackPiston Garage, ${userName}!</h2>
      <p>We're thrilled to have you join our community.</p>
      <p>You can now book services, purchase parts, and track your builds straight from your dashboard.</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="http://localhost:5000/profile" style="background-color: #ff3333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Your Dashboard</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Ride safe,<br/>
        The BlackPiston Team
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendOrderConfirmation = async (userEmail: string, orderData: any) => {
  const subject = `Order Confirmation - #${orderData.orderNumber}`;
  
  let itemsHtml = "";
  if (orderData.products && Array.isArray(orderData.products)) {
    itemsHtml = orderData.products.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.totalPrice}</td>
      </tr>
    `).join("");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff3333;">Order Confirmed!</h2>
      <p>Thank you for your order, ${orderData.user?.name || "Customer"}.</p>
      <p><strong>Order ID:</strong> ${orderData.orderNumber}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f9f9f9; text-align: left;">
            <th style="padding: 8px;">Item</th>
            <th style="padding: 8px;">Qty</th>
            <th style="padding: 8px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Total Amount:</td>
            <td style="padding: 8px; font-weight: bold;">₹${orderData.totalAmount}</td>
          </tr>
        </tfoot>
      </table>

      ${orderData.shippingAddress ? `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <h4>Delivery Address</h4>
          <p style="margin: 0; color: #555;">
            ${orderData.shippingAddress.name || ""}<br>
            ${orderData.shippingAddress.street || ""}<br>
            ${orderData.shippingAddress.city || ""}, ${orderData.shippingAddress.state || ""} ${orderData.shippingAddress.pincode || ""}
          </p>
        </div>
      ` : ""}
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="http://localhost:5000/profile/orders" style="background-color: #111; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendOrderStatusUpdate = async (userEmail: string, orderNumber: string, newStatus: string) => {
  const subject = `Order Status Update - #${orderNumber}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff3333;">Order Update</h2>
      <p>Hello,</p>
      <p>Your order <strong>#${orderNumber}</strong> status has been updated to: <strong style="font-size: 16px; color: #ff3333;">${newStatus}</strong></p>
      
      <p>You can check the complete details and history in your dashboard.</p>
      <div style="margin-top: 30px;">
        <a href="http://localhost:5000/profile/orders" style="background-color: #111; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};

export const sendPasswordResetEmail = async (userEmail: string, resetToken: string) => {
  const subject = "Reset Your Password";
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5000"}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff3333;">Password Reset Request</h2>
      <p>We received a request to reset your password for your BlackPiston Garage account.</p>
      <p>Click the button below to choose a new password:</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="\${resetLink}" style="background-color: #ff3333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
      <p><a href="\${resetLink}">\${resetLink}</a></p>
      <p style="margin-top: 30px; font-size: 14px; color: #555;">This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #888;">
        Ride safe,<br/>
        The BlackPiston Team
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
};
