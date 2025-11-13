# Gmail Email Setup

This guide explains how to configure Gmail to send invitation emails.

## Prerequisites

1. A Gmail account
2. 2-Step Verification enabled on your Gmail account

## Setup Steps

### 1. Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", enable **2-Step Verification**

### 2. Generate an App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter a name like "Flowtusk Email Service"
5. Click "Generate"
6. **Copy the 16-character password** (you'll need this for the environment variable)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Gmail Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Optional: Customize app name and site URL
APP_NAME=Flowtusk
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Testing

1. Go to the Invitations page (`/u/invitations`)
2. Click "Invite User"
3. Enter an email address
4. Click "Send Invitation"
5. Check the recipient's inbox for the invitation email

## Troubleshooting

### "Gmail credentials not configured" error

- Make sure `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` are set in your `.env.local` file
- Restart your development server after adding environment variables

### "Invalid login" or authentication errors

- Verify your app password is correct (16 characters, no spaces)
- Make sure 2-Step Verification is enabled on your Gmail account
- Try generating a new app password

### Emails not being received

- Check spam/junk folder
- Verify the email address is correct
- Check server logs for error messages
- Ensure `NEXT_PUBLIC_SITE_URL` is set correctly for production

## Security Notes

- **Never commit** `.env.local` to version control
- App passwords are safer than using your regular Gmail password
- Each app password can be revoked individually if compromised
- Consider using a dedicated Gmail account for production emails

## Production Considerations

For production, consider:
- Using a dedicated email service (SendGrid, Resend, AWS SES)
- Setting up SPF/DKIM records for better deliverability
- Using a custom domain email address
- Implementing email retry logic for failed sends

