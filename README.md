# Chattable

**Chattable** is a no-code platform that lets cafés and restaurants build their own voice-driven ordering systems — turning ordering into a natural, human conversation. Powered by AI (Google Gemini) and ElevenLabs voice technology, Chattable enables restaurants to deploy voice ordering across multiple touchpoints including kiosks, drive-thrus, tablets, and QR codes.

## 🎯 Features

- **🎤 Voice-Powered Ordering** - Customers place orders naturally through conversation. No menus to navigate, just speak.
- **🤖 AI-Powered Intelligence** - Advanced AI understands context, preferences, and handles complex orders with ease.
- **📋 Smart Menu Management** - Easily manage your menu, categories, and availability. Update prices and items instantly.
- **📊 Real-Time Order Tracking** - Track orders from placement to completion.
- **📚 Knowledge Base** - Train your AI with restaurant-specific information, specials, and customer preferences.
- **⚙️ Easy Setup** - Get started in minutes. No coding required. Configure your voice agent and deploy.

## 🚀 Use Cases

- **Kiosk** - In-store self-service ordering kiosk
- **Drive-Thru** - Voice ordering at drive-thru windows
- **Tablet** - Table-side ordering for dine-in customers
- **QR Code** - Place QR codes on tables for customer self-service

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Storage**: Supabase
- **AI**: Google Gemini (via LangChain)
- **Voice**: ElevenLabs
- **Styling**: Tailwind CSS, Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- PostgreSQL database
- Supabase account (for file storage)
- Google Cloud account (for Gemini API)
- ElevenLabs account (for voice synthesis)
- Google OAuth credentials (optional, for social login)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmadnurfadilah/chattable
   cd chattable
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Google Gemini AI
   GOOGLE_API_KEY="your-google-api-key"

   # ElevenLabs
   ELEVENLABS_API_KEY="your-elevenlabs-api-key"
   ELEVENLABS_WEBHOOK_SECRET="your-webhook-secret"
   ```

4. **Set up the database**

   Run migrations to set up the database schema:
   ```bash
   npx drizzle-kit push
   ```

   Optionally, seed the database with sample data:
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
chattable/
├── app/                    # Next.js app directory
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── knowledge-base/# Knowledge base management
│   │   ├── menu/          # Menu management
│   │   ├── order/         # Order management
│   │   ├── publish/       # Publish voice agent
│   │   └── settings/      # Settings page
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── (onboard)/         # Onboarding flow
│   ├── api/               # API routes
│   │   ├── [restaurantId]/# Restaurant-specific APIs
│   │   ├── auth/          # Auth API routes
│   │   └── webhook/       # Webhook handlers
│   ├── order/             # Public order page
│   └── voice-chat/        # Voice chat interface
├── components/            # React components
│   ├── form/              # Form components
│   ├── publish/            # Publish-related components
│   └── ui/                 # UI components (shadcn)
├── drizzle/               # Database schema and migrations
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── actions/           # Server actions
│   ├── auth.ts            # Auth configuration
│   ├── config.ts          # AI agent configuration
│   ├── elevenlabs.ts      # ElevenLabs client
│   └── supabase.ts        # Supabase client
└── public/                # Static assets
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ⚠️ |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | ✅ |
| `BETTER_AUTH_URL` | Base URL for Better Auth | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ⚠️ |
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | ✅ |
| `ELEVENLABS_WEBHOOK_SECRET` | Webhook secret for ElevenLabs | ✅ |

## 🗄️ Database

This project uses **Drizzle ORM** with PostgreSQL. The database schema is defined in `drizzle/db/schema.ts`.

### Running Migrations

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes to database
npx drizzle-kit push

# Run migrations
npx drizzle-kit migrate
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with sample data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [Google Gemini API](https://ai.google.dev/docs)

---

Built with ❤️ for restaurants and cafés
