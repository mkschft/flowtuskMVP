# Quick Auth Testing Guide

## 🚀 Test Sign Up & Login Flow

### Prerequisites

1. **Supabase Configuration** (One-time setup):
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:3000` (or your production URL)
   - Add **Redirect URLs**:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/confirm`
     - `http://localhost:3000/auth/update-password`

2. **Environment Variables** (check `.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Step-by-Step Test

#### 1. Test Sign Up

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to sign up:**
   - Go to `http://localhost:3000/auth/sign-up`
   - Or click "Sign Up" from the landing page

3. **Fill out the form:**
   - Use a **real email address** (you'll need to check it)
   - Password: minimum 6 characters
   - Repeat password: must match

4. **Submit:**
   - Should see "Creating an account..." button state
   - Should redirect to `/auth/sign-up-success`
   - Should see success message: "Check your email to confirm"

5. **Check your email:**
   - Look for confirmation email from Supabase
   - Click the confirmation link
   - Should redirect to `/auth/confirm` then to `/app`
   - You should now be logged in!

#### 2. Test Login

1. **Navigate to login:**
   - Go to `http://localhost:3000/auth/login`
   - Or try accessing `/app` while logged out (will auto-redirect)

2. **Enter credentials:**
   - Use the email/password you just signed up with
   - Click "Login"

3. **Verify:**
   - Should redirect to `/app`
   - Should see your app content (not login page)
   - Check browser console for: `✅ [Auth] User authenticated or demo mode`

#### 3. Test Route Protection

1. **While logged out:**
   - Try visiting `http://localhost:3000/app`
   - Should automatically redirect to `/auth/login?redirectTo=/app`

2. **While logged in:**
   - Try visiting `http://localhost:3000/auth/login`
   - Should automatically redirect to `/app`

3. **After login:**
   - Should redirect back to the original protected route (`/app`)

#### 4. Test Logout

1. **Find logout button:**
   - Look for logout button in your app UI
   - Or navigate to a page with `<LogoutButton />`

2. **Click logout:**
   - Should sign out
   - Should redirect to `/auth/login`
   - Try accessing `/app` again → should redirect to login

#### 5. Test Password Reset (Optional)

1. **Go to forgot password:**
   - Visit `http://localhost:3000/auth/forgot-password`
   - Enter your email
   - Submit

2. **Check email:**
   - Look for password reset email
   - Click the reset link
   - Should go to `/auth/update-password`
   - Enter new password
   - Should redirect to `/app`

## 🐛 Troubleshooting

### Sign Up Issues

**Problem:** "Email already registered"
- **Solution:** Use a different email or reset password for existing account

**Problem:** No confirmation email received
- **Check:** Spam/junk folder
- **Check:** Supabase Dashboard → Authentication → Email Templates (should be enabled)
- **Check:** Supabase project is active (not paused)

**Problem:** Confirmation link doesn't work
- **Check:** Redirect URLs in Supabase Dashboard include your domain
- **Check:** `emailRedirectTo` in sign-up form points to `/auth/confirm`

### Login Issues

**Problem:** "Invalid login credentials"
- **Check:** Email is confirmed (check email for confirmation link)
- **Check:** Password is correct
- **Check:** User exists in Supabase Dashboard → Authentication → Users

**Problem:** Redirects to login after successful login
- **Check:** Middleware is working (check `middleware.ts` exists)
- **Check:** Browser console for errors
- **Check:** Supabase session cookies are being set

### Route Protection Issues

**Problem:** Can access `/app` without login
- **Check:** `middleware.ts` exists in root directory
- **Check:** Demo mode is disabled: `NEXT_PUBLIC_DEMO_MODE_ENABLED=false`
- **Check:** Middleware matcher config includes `/app`

**Problem:** Stuck in redirect loop
- **Check:** Supabase env vars are correct
- **Check:** Browser cookies (try incognito mode)
- **Check:** Console for middleware errors

## ✅ Success Checklist

After testing, you should be able to:
- [ ] Sign up with a new email
- [ ] Receive and click confirmation email
- [ ] Get redirected to `/app` after confirmation
- [ ] Log in with confirmed credentials
- [ ] Access protected routes while logged in
- [ ] Get redirected to login when accessing protected routes while logged out
- [ ] Get redirected away from auth pages when already logged in
- [ ] Log out successfully
- [ ] Reset password (optional)

## 🎯 Quick Test Commands

```bash
# Check if middleware exists
ls middleware.ts

# Check env vars (don't commit these!)
cat .env.local | grep SUPABASE

# Check Supabase connection
# Visit: http://localhost:3000/auth/login
# Check browser console for Supabase errors
```

## 📝 Notes

- **Email confirmation is required** for new signups (Supabase default)
- You can disable email confirmation in Supabase Dashboard → Authentication → Settings
- For testing, you can use services like [Mailtrap](https://mailtrap.io) or [Ethereal Email](https://ethereal.email)
- Demo mode bypasses all auth checks - disable for real testing

