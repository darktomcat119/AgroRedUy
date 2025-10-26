# AgroRed Uy - Unified Next.js Project

This is a unified Next.js project that combines all the individual pages from the Refers directory into a single, cohesive application.

## Project Structure

The project includes the following pages:

- **Home** (`/`) - Main landing page with hero section and user type selection
- **Contact** (`/contacto`) - Contact form and information
- **Login** (`/login`) - User authentication page
- **Register** (`/register`) - User registration page
- **Services** (`/servicios`) - Service details and search
- **Services List** (`/servicios/lista`) - List of available services

## Features

- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful, modern UI
- **Component Library**: Uses shadcn/ui components for consistent design
- **Custom Styling**: AgroRed brand colors and typography
- **Navigation**: Consistent navigation across all pages
- **Assets**: All Figma assets consolidated in `/public/figmaAssets/`

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **State Management**: React Query (TanStack Query)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Pages

### Home Page (`/`)
- Hero section with "Conectamos el campo URUGUAYO" message
- Feature cards (Geolocalizado, Red Confiable, Conexión Directa, Calificaciones)
- User type selection (SOY PRODUCTOR, SOY CONTRATISTA)
- Navigation to other pages

### Contact Page (`/contacto`)
- Contact form with fields for name, phone, email, and message
- Contact information display
- Consistent navigation

### Login Page (`/login`)
- Email and password fields
- Social login options (Google, Apple, Facebook)
- Link to registration page

### Register Page (`/register`)
- Registration form
- Social login options
- Link to login page

### Services Page (`/servicios`)
- Service search and filtering
- Service details with crop badges
- Image gallery
- Calendar integration
- Map display

### Services List Page (`/servicios/lista`)
- Grid of available services
- Service cards with details (harvester, price, contact, description)
- "Ver disponibilidad" buttons

## Styling

The project uses a custom color palette and typography system:

### Colors
- `verdeprimario-100`: Primary green (#2d8341)
- `verdesecundario-100`: Secondary green (#60a646)
- `naranja-100`: Orange (#f67f2d)
- `blanco-100`: White (#ffffff)
- `grisprimario-100`: Light gray (#f2f2f2)

### Typography
- **Barlow**: Used for headings (Bold 64pt, Bold Italic 96pt)
- **Raleway**: Used for body text (Bold, Medium, Regular variants)

## Components

### UI Components (`/components/ui/`)
- Button, Input, Label, Card, Separator
- Built with Radix UI primitives
- Consistent styling with Tailwind CSS

### Section Components (`/components/sections/`)
- NavigationMenuSection
- ServiceDetailsSection
- CalendarSection

## Assets

All design assets are located in `/public/figmaAssets/` and include:
- SVG icons and illustrations
- PNG images and backgrounds
- Logo files

## Development Notes

- All pages are server-side rendered with Next.js App Router
- TypeScript is strictly enforced
- Tailwind CSS provides utility-first styling
- Components are modular and reusable
- Navigation is consistent across all pages

## Deployment

The project can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway
- Heroku

Build the project with `npm run build` and deploy the generated files.

