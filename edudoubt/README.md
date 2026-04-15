# EduDoubt

AI-powered doubt solving platform for students.

## Setup

```bash
npm install
cp .env.local .env.local   # fill in your keys
npm run dev
```

## Environment Variables

Fill in `.env.local` with:
- `MONGODB_URI` — MongoDB Atlas connection string
- `NEXTAUTH_SECRET` — any random string (run: `openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `AGORA_APP_ID` / `AGORA_APP_CERTIFICATE` — from agora.io
- `CLOUDINARY_*` — from cloudinary.com
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from razorpay.com
- `NEXT_PUBLIC_AGORA_APP_ID` — same as AGORA_APP_ID
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as RAZORPAY_KEY_ID

## Stack

- Next.js 14 App Router + TypeScript
- MongoDB + Mongoose
- NextAuth.js (Google + Credentials)
- Anthropic Claude API
- Agora RTC (video calls)
- Socket.io (real-time chat + whiteboard)
- Razorpay (payments)
- KaTeX (math rendering)
- Tailwind CSS + Dark mode
