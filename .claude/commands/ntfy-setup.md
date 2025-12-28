---
description: Configure NTFY push notifications for workflow updates
---

# NTFY Setup

Configure push notifications via [ntfy.sh](https://ntfy.sh) to receive workflow updates on your phone.

## Step 1: Install NTFY App

Download the NTFY app:

- **iOS**: [App Store](https://apps.apple.com/app/ntfy/id1625396347)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=io.heckel.ntfy) or [F-Droid](https://f-droid.org/packages/io.heckel.ntfy/)

## Step 2: Choose a Topic

Pick a unique, hard-to-guess topic name for your notifications:

```
your-name-api-dev-2024
```

**Important:** Topics are public on ntfy.sh. Use a unique name!

## Step 3: Subscribe in App

1. Open the NTFY app
2. Tap the + button
3. Enter your topic name
4. Tap Subscribe

## Step 4: Configure Environment

Add to your project's `.env` file:

```env
NTFY_ENABLED=true
NTFY_SERVER=https://ntfy.sh
NTFY_TOPIC=your-unique-topic-name
```

Or copy from the template:

```bash
cp templates/.env.example .env
# Then edit .env with your topic
```

## Step 5: Test Notification

Run this command to test:

```bash
/ntfy-test
```

You should receive a test notification on your phone.

## What You'll Receive

- 📋 Phase completion updates
- ⏳ "Input needed" alerts when interview questions are waiting
- 📊 Token usage summaries
- ✅ Workflow completion notifications

## Self-Hosted Option

If you prefer to self-host NTFY:

```bash
docker run -d -p 8080:80 binwiederhier/ntfy serve
```

Then set:

```env
NTFY_SERVER=http://localhost:8080
```

## Troubleshooting

**Not receiving notifications?**

1. Check NTFY_ENABLED=true in .env
2. Verify topic name matches exactly
3. Check app notification permissions
4. Run `/ntfy-test` to verify connection

**Rate limited?**
ntfy.sh has rate limits. Consider self-hosting for heavy use.
