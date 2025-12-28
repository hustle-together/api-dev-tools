---
description: Send a test notification via NTFY
---

# NTFY Test

Send a test notification to verify your NTFY setup is working.

## Steps

1. **Read environment configuration**:

```bash
grep NTFY .env 2>/dev/null || echo "No .env file found"
```

2. **Send test notification**:

```bash
# Get config
source .env 2>/dev/null

if [ "$NTFY_ENABLED" = "true" ] && [ -n "$NTFY_TOPIC" ]; then
  curl -s \
    -H "Title: 🧪 API Dev Tools Test" \
    -H "Priority: default" \
    -H "Tags: test,rocket" \
    -d "Test notification from API Dev Tools. If you see this, NTFY is configured correctly!" \
    "${NTFY_SERVER:-https://ntfy.sh}/$NTFY_TOPIC"
  echo ""
  echo "✅ Test notification sent to topic: $NTFY_TOPIC"
else
  echo "❌ NTFY not configured. Run /ntfy-setup first."
  echo ""
  echo "Required in .env:"
  echo "  NTFY_ENABLED=true"
  echo "  NTFY_TOPIC=your-topic-name"
fi
```

3. **Verify on phone**:

Check your NTFY app - you should see the test notification within a few seconds.

## Expected Result

You should receive a notification with:

- Title: "🧪 API Dev Tools Test"
- Message: "Test notification from API Dev Tools..."
- Tags: test, rocket emojis

## Troubleshooting

**"NTFY not configured" error:**

- Run `/ntfy-setup` to configure
- Or manually add to .env:
  ```env
  NTFY_ENABLED=true
  NTFY_TOPIC=your-unique-topic
  ```

**No notification received:**

1. Check topic name matches your app subscription
2. Verify phone has internet connection
3. Check NTFY app notification permissions
4. Try visiting https://ntfy.sh/your-topic in browser

**curl error:**

- Ensure you have internet connection
- Check if ntfy.sh is accessible: `curl -I https://ntfy.sh`
