export const registeringEmail = (
    email: string,
    first_name: string,
    last_name: string,
    token: string
  ) => {
    const emailData = {
      email: email,
      subject: 'Activate your account',
      html: `<h1>Hello ${first_name} ${last_name}</h1> <p>You can activate your account by clicking on the Activate link below.
    Note: the Link vaild for one hour</p>
    <a href="http://localhost:5173/users/activate/${token}">Clink here to activate</a>      `,
    }
    return emailData
  }
  
  export const forgetPasswordEmail = (
    email: string,
    first_name: string,
    last_name: string,
    token: string
  ) => {
    const emailData = {
      email: email,
      subject: 'Forgot Password',
      html: `<h1>Hello ${first_name} ${last_name}</h1> 
      <p>We received a request to reset your password. Please click the link below to create a new password:</p>
      <a href="http://localhost:5173/users/reset-password/${token}">Reset Password</a> 
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <p>Best regards,<br>Developer Shahad</p>     `,
    }
    return emailData
  }
  
  export const OrderCreatedEmail = (
    email: string,
    first_name: string,
    last_name: string,
    totalAmount: number
  ) => {
    const emailData = {
      email: email, // recipient email
        html: `<h1>Hello ${first_name} ${last_name}</h1>
         <h4>We are sending you this email to inform you that your order has been created with a total amount of ${totalAmount}</h4>
         <p>Thank you for shopping with us</p>`,
        subject: 'Order Created'
    }
    return emailData
  }
  export const OrderUpdatedEmail = (
    email: string,
    first_name: string,
    last_name: string,
    status: string
  ) => {
    const emailData = {
      email: email, // recipient email
      html: `<h1>Hello ${first_name} ${last_name}</h1>
         <h4>We are sending you this email to inform you that your order status has changed to ${status}</h4>
         <p>Thank you for shopping with us</p>`,
      subject: 'Order Status Changed',
    }
    return emailData
  }