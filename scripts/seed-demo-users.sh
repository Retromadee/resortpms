#!/usr/bin/env bash
# seed-demo-users.sh — Create and confirm the 5 demo users in a dev Supabase project.
# Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (or exported).
# Safe to re-run: skips users that are already confirmed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load env
if [[ -f "$PROJECT_DIR/.env.local" ]]; then
  set -a; source "$PROJECT_DIR/.env.local"; set +a
fi

URL="${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL in .env.local}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY in .env.local}"

declare -A USERS=(
  ["guest.demo@example.test"]="DemoGuest123!:Guest Demo"
  ["resident.demo@example.test"]="DemoResident123!:Resident Demo"
  ["worker.demo@example.test"]="DemoWorker123!:Worker Demo"
  ["manager.demo@example.test"]="DemoManager123!:Management Demo"
  ["admin.demo@example.test"]="DemoAdmin123!:Admin Demo"
)

echo "🌱 Seeding demo users into $URL"
echo ""

for email in "${!USERS[@]}"; do
  IFS=':' read -r password full_name <<< "${USERS[$email]}"

  # Create user with email auto-confirmed via admin API
  response=$(curl -s "$URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"email_confirm\": true,
      \"user_metadata\": {\"full_name\": \"$full_name\"}
    }")

  id=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
  err=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('msg',''))" 2>/dev/null || echo "")

  if [[ -n "$id" && "$id" != "" ]]; then
    echo "  ✅ $email → $id"
  elif echo "$err" | grep -qi "already"; then
    echo "  ⏭️  $email already exists — confirming..."
    # Find existing user and confirm
    existing=$(curl -s "$URL/auth/v1/admin/users?filter=email%20eq%20$email" \
      -H "apikey: $SERVICE_KEY" \
      -H "Authorization: Bearer $SERVICE_KEY" 2>/dev/null)
    uid=$(echo "$existing" | python3 -c "import sys,json; u=json.load(sys.stdin).get('users',[]); print(u[0]['id'] if u else '')" 2>/dev/null || echo "")
    if [[ -n "$uid" ]]; then
      # Update password and confirm email
      curl -s "$URL/auth/v1/admin/users/$uid" \
        -X PUT \
        -H "apikey: $SERVICE_KEY" \
        -H "Authorization: Bearer $SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"password\": \"$password\", \"email_confirm\": true}" > /dev/null
      echo "  ✅ $email → $uid (confirmed + password reset)"
    else
      echo "  ❌ $email — could not find existing user"
    fi
  else
    echo "  ❌ $email — $err"
    echo "     $response"
  fi
done

echo ""
echo "🎯 Now run the demo-users.sql in the Supabase SQL Editor to assign roles and seed data."
echo "   File: supabase/demo-users.sql"
