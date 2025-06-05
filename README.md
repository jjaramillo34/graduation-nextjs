# NYC Schools Graduation Registration System

A complete Next.js application for managing graduation ceremony registrations for NYC Department of Education District 79 schools.

## Features

- **Event Management**: Display all graduation ceremonies with details
- **Registration System**: Secure registration with email domain validation
- **Capacity Limits**: Maximum 2 participants per event
- **Admin Dashboard**: View all registrations and export data
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live registration counts and availability

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd graduation-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/graduation-registration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Seed the database**
   Visit `/api/seed` (GET request) to populate the database with events from the JSON file.

## Usage

### Public Registration
- Visit the homepage to view all graduation events
- Click "Register Now" on any available event
- Fill out the registration form with a valid @schools.nyc.gov email
- Submit to complete registration

### Admin Dashboard
- Visit `/admin` to access the admin dashboard
- View all registrations, statistics, and event data
- Export registration data to CSV format

## API Endpoints

- `GET /api/events` - Fetch all events with registration counts
- `POST /api/register` - Submit a new registration
- `GET /api/registrations` - Get all registrations (admin)
- `GET /api/seed` - Seed database with events from JSON file
- `POST /api/seed` - Alternative seeding method

## Database Schema

### Events Collection
```typescript
{
  id: number;
  school_number: string;
  principal: string;
  date: string;
  time: string;
  location: string;
  ceremony_type: string;
  title: string;
  year: string;
}
```

### Registrations Collection
```typescript
{
  eventId: number;
  email: string; // Must end with @schools.nyc.gov
  name: string;
  registeredAt: Date;
}
```

## Validation Rules

- **Email**: Must end with `@schools.nyc.gov`
- **Name**: 2-100 characters, required
- **Event Capacity**: Maximum 2 registrations per event
- **Duplicate Prevention**: One registration per email per event

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build the image
docker build -t graduation-registration .

# Run the container
docker run -p 3000:3000 graduation-registration
```

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/graduation-registration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── events/        # Events API
│   │   ├── register/      # Registration API
│   │   ├── registrations/ # Admin data API
│   │   └── seed/          # Database seeding
│   ├── admin/             # Admin dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── EventCard.tsx     # Event display component
│   └── RegistrationForm.tsx # Registration form
├── lib/                  # Utilities and configurations
│   ├── models/           # Mongoose models
│   ├── mongodb.ts        # Database connection
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
└── types/                # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Security

- Email validation ensures only NYC DOE staff can register
- Input validation and sanitization
- Rate limiting on API endpoints (recommended for production)
- Secure database connections with authentication
