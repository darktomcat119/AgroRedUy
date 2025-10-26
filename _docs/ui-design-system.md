# UI/UX Design System - AgroRedUy

## 🎨 Design Philosophy

### Core Design Principles
- **Agricultural-First**: Every design decision serves the agricultural community
- **Simplicity**: Complex agricultural processes made simple through intuitive design
- **Accessibility**: Inclusive design for all users, including those with disabilities
- **Mobile-First**: Designed for agricultural workers who primarily use mobile devices
- **Performance**: Fast, responsive design optimized for rural internet connections

### Brand Identity
AgroRedUy represents the connection between technology and agriculture in Uruguay. The design system reflects the natural, growth-oriented, and community-focused nature of the agricultural sector.

## 🎨 Color System

### Primary Colors
```css
/* Primary Green - Main brand color */
--verdeprimario-100: rgba(45, 131, 65, 1);     /* #2d8341 */
--verdeprimario-60: rgba(45, 131, 65, 0.6);   /* #2d8341 with 60% opacity */

/* Secondary Green - Supporting brand color */
--verdesecundario-100: rgba(96, 166, 70, 1);   /* #60a646 */

/* Orange - Accent color for CTAs and highlights */
--naranja-100: rgba(246, 127, 45, 1);          /* #f67f2d */
--naranja-50: rgba(246, 127, 45, 0.5);         /* #f67f2d with 50% opacity */
```

### Neutral Colors
```css
/* White */
--blanco-100: rgba(255, 255, 255, 1);         /* #ffffff */

/* Grays */
--grisprimario-100: rgba(242, 242, 242, 1);   /* #f2f2f2 */
--grisprimario-10: rgba(242, 242, 242, 0.1);  /* #f2f2f2 with 10% opacity */
--grissecundario-100: rgba(200, 200, 200, 1);  /* #c8c8c8 */

/* Black */
--negro-100: rgba(0, 0, 0, 1);                /* #000000 */
```

### Color Usage Guidelines

#### Primary Green (`verdeprimario-100`)
- **Primary buttons**: Main call-to-action buttons
- **Navigation**: Active navigation states
- **Success states**: Confirmation messages
- **Brand elements**: Logo and key brand elements

#### Secondary Green (`verdesecundario-100`)
- **Secondary buttons**: Alternative actions
- **Hover states**: Interactive element hover
- **Progress indicators**: Loading and progress states
- **Accent elements**: Supporting visual elements

#### Orange (`naranja-100`)
- **Warning states**: Important notifications
- **Highlights**: Key information emphasis
- **Accent CTAs**: Special call-to-action buttons
- **Alert states**: Critical information

#### Neutral Colors
- **Backgrounds**: Page and section backgrounds
- **Text**: Primary and secondary text colors
- **Borders**: Subtle borders and dividers
- **Shadows**: Depth and elevation effects

## 📝 Typography System

### Font Families

#### Barlow (Headings)
```css
/* Barlow Bold 64pt - Hero headings */
--barlow-bold-64pt-font-family: "Barlow", Helvetica;
--barlow-bold-64pt-font-size: 64px;
--barlow-bold-64pt-font-weight: 700;

/* Barlow Bold Italic 96pt - Large hero text */
--barlow-bold-italic-96pt-font-family: "Barlow", Helvetica;
--barlow-bold-italic-96pt-font-style: italic;
--barlow-bold-italic-96pt-font-weight: 700;

/* Barlow Medium 20pt - Section headings */
--barlow-medium-20pt-font-family: "Barlow", Helvetica;
--barlow-medium-20pt-font-size: 20px;
--barlow-medium-20pt-font-weight: 500;
```

#### Raleway (Body Text)
```css
/* Raleway Bold 20pt - Large headings */
--raleway-bold-20pt-font-family: "Raleway", Helvetica;
--raleway-bold-20pt-font-size: 20px;
--raleway-bold-20pt-font-weight: 700;

/* Raleway Bold 16pt - Medium headings */
--raleway-bold-16pt-font-family: "Raleway", Helvetica;
--raleway-bold-16pt-font-size: 16px;
--raleway-bold-16pt-font-weight: 700;

/* Raleway Bold 14pt - Small headings */
--raleway-bold-14pt-font-family: "Raleway", Helvetica;
--raleway-bold-14pt-font-size: 14px;
--raleway-bold-14pt-font-weight: 700;

/* Raleway Medium 16pt - Body text */
--raleway-medium-16pt-font-family: "Raleway", Helvetica;
--raleway-medium-16pt-font-size: 16px;
--raleway-medium-16pt-font-weight: 500;

/* Raleway Medium 14pt - Small body text */
--raleway-medium-14pt-font-family: "Raleway", Helvetica;
--raleway-medium-14pt-font-size: 14px;
--raleway-medium-14pt-font-weight: 500;

/* Raleway Regular 20pt - Large body text */
--raleway-regular-20pt-font-family: "Raleway", Helvetica;
--raleway-regular-20pt-font-size: 20px;
--raleway-regular-20pt-font-weight: 400;

/* Raleway Semibold Italic 20pt - Emphasized text */
--raleway-semibold-italic-20pt-font-family: "Raleway", Helvetica;
--raleway-semibold-italic-20pt-font-style: italic;
--raleway-semibold-italic-20pt-font-weight: 600;
```

### Typography Scale
```css
/* Hero Text Sizes */
.hero-sm { font-size: 2.5rem; line-height: 1.2; }
.hero-md { font-size: 3.5rem; line-height: 1.1; }
.hero-lg { font-size: 4rem; line-height: 1; }
.hero-xl { font-size: 5rem; line-height: 0.9; }
.hero-2xl { font-size: 6rem; line-height: 0.8; }
```

### Typography Usage Guidelines

#### Headings Hierarchy
1. **H1 (Hero)**: Barlow Bold 64pt - Main page titles
2. **H2 (Section)**: Barlow Medium 20pt - Section headings
3. **H3 (Subsection)**: Raleway Bold 20pt - Subsection headings
4. **H4 (Card Title)**: Raleway Bold 16pt - Card and component titles
5. **H5 (Small Heading)**: Raleway Bold 14pt - Small headings

#### Body Text Hierarchy
1. **Large Body**: Raleway Regular 20pt - Important body text
2. **Body**: Raleway Medium 16pt - Standard body text
3. **Small Body**: Raleway Medium 14pt - Secondary information
4. **Emphasized**: Raleway Semibold Italic 20pt - Special emphasis

## 🧩 Component System

### Base Components (shadcn/ui)

#### Button Component
```tsx
// Primary Button
<Button className="bg-verdeprimario-100 hover:bg-verdeprimario-100/90 text-white">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-verdeprimario-100 text-verdeprimario-100">
  Secondary Action
</Button>

// Destructive Button
<Button className="bg-red-500 hover:bg-red-600 text-white">
  Delete
</Button>
```

#### Input Component
```tsx
// Standard Input
<Input 
  placeholder="Enter text..."
  className="border-gray-300 focus:border-verdeprimario-100 focus:ring-verdeprimario-100"
/>

// Search Input
<Input 
  placeholder="Search services..."
  className="border-gray-300 focus:border-verdeprimario-100"
/>
```

#### Card Component
```tsx
// Service Card
<Card className="p-6 hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="text-verdeprimario-100">Service Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-600">Service description...</p>
  </CardContent>
</Card>
```

### Custom Components

#### Service Search Bar
```tsx
// Airbnb-style search bar
<div className="flex w-[903px] h-[92px] items-center justify-center p-[7px] bg-white rounded-[45px] shadow-lg border border-gray-200">
  <SearchDropdown 
    label="Servicios:"
    placeholder="¿Qué servicio necesitas?"
    options={serviceOptions}
  />
  <DateRangePicker 
    label="Fechas:"
    placeholder="¿Cuándo?"
  />
  <SearchDropdown 
    label="Zona:"
    placeholder="¿Dónde?"
    options={locationOptions}
  />
  <Button className="bg-verdesecundario-100 hover:bg-verdeprimario-100 rounded-full">
    <SearchIcon className="w-5 h-5" />
  </Button>
</div>
```

#### Service Card
```tsx
// Service listing card
<Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
  <div className="relative">
    <Image 
      src={service.image} 
      alt={service.title}
      className="w-full h-48 object-cover"
    />
    <Badge className="absolute top-4 right-4 bg-verdeprimario-100 text-white">
      {service.category}
    </Badge>
  </div>
  <CardContent className="p-6">
    <h3 className="font-bold text-lg text-verdeprimario-100 mb-2">
      {service.title}
    </h3>
    <p className="text-gray-600 mb-4">{service.description}</p>
    <div className="flex justify-between items-center">
      <span className="text-2xl font-bold text-verdeprimario-100">
        ${service.price}/hora
      </span>
      <Button className="bg-verdesecundario-100 hover:bg-verdeprimario-100">
        Ver disponibilidad
      </Button>
    </div>
  </CardContent>
</Card>
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small devices (phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Mobile-First Guidelines
- **Touch Targets**: Minimum 44px touch targets
- **Spacing**: Generous spacing for easy interaction
- **Typography**: Readable font sizes on small screens
- **Navigation**: Thumb-friendly navigation patterns
- **Performance**: Optimized for slower mobile connections

### Responsive Components
```tsx
// Responsive Service Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {services.map(service => (
    <ServiceCard key={service.id} service={service} />
  ))}
</div>

// Responsive Navigation
<nav className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
  <Link href="/">Inicio</Link>
  <Link href="/servicios">Servicios</Link>
  <Link href="/contacto">Contacto</Link>
</nav>
```

## 🎯 User Experience Patterns

### Navigation Patterns
- **Primary Navigation**: Main site navigation
- **Breadcrumbs**: Location awareness
- **Search**: Global search functionality
- **Filters**: Service filtering options
- **Pagination**: Content pagination

### Interaction Patterns
- **Hover States**: Visual feedback on interaction
- **Loading States**: Clear loading indicators
- **Error States**: Helpful error messages
- **Success States**: Confirmation feedback
- **Empty States**: Helpful empty state messages

### Form Patterns
- **Validation**: Real-time form validation
- **Error Messages**: Clear, actionable error messages
- **Success Feedback**: Confirmation of successful actions
- **Progressive Disclosure**: Show information when needed
- **Auto-save**: Save user input automatically

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Alternative Text**: Descriptive alt text for images

### Accessibility Implementation
```tsx
// Accessible Button
<Button 
  aria-label="Search for services"
  className="bg-verdeprimario-100 text-white"
>
  <SearchIcon className="w-5 h-5" aria-hidden="true" />
  Buscar
</Button>

// Accessible Form
<form role="search" aria-label="Service search">
  <Input 
    aria-label="Service type"
    placeholder="¿Qué servicio necesitas?"
    required
  />
</form>
```

## 🎨 Animation & Transitions

### Animation Principles
- **Purposeful**: Animations serve a functional purpose
- **Smooth**: 60fps animations for smooth experience
- **Consistent**: Consistent timing and easing
- **Accessible**: Respect user motion preferences
- **Performance**: Optimized for mobile devices

### Transition Classes
```css
/* Standard Transitions */
.transition-all { transition: all 0.2s ease-in-out; }
.transition-colors { transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out; }
.transition-transform { transition: transform 0.2s ease-in-out; }

/* Hover Effects */
.hover\:scale-105:hover { transform: scale(1.05); }
.hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

/* Custom Animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

## 📐 Spacing System

### 8px Grid System
```css
/* Spacing Scale */
space-1: 0.25rem;  /* 4px */
space-2: 0.5rem;   /* 8px */
space-3: 0.75rem;  /* 12px */
space-4: 1rem;     /* 16px */
space-6: 1.5rem;   /* 24px */
space-8: 2rem;     /* 32px */
space-12: 3rem;    /* 48px */
space-16: 4rem;    /* 64px */
space-24: 6rem;    /* 96px */
```

### Spacing Usage
- **Component Padding**: 16px (space-4) standard padding
- **Section Spacing**: 48px (space-12) between sections
- **Card Spacing**: 24px (space-6) between cards
- **Form Spacing**: 16px (space-4) between form elements

## 🖼️ Image Guidelines

### Image Specifications
- **Hero Images**: 1920x1080px, WebP format
- **Service Images**: 800x600px, WebP format
- **Profile Images**: 400x400px, WebP format
- **Icons**: 24x24px, SVG format
- **Logos**: 200x60px, SVG format

### Image Optimization
```tsx
// Next.js Image Component
<Image
  src="/images/service-hero.jpg"
  alt="Agricultural service"
  width={800}
  height={600}
  className="rounded-lg"
  priority // For above-the-fold images
/>
```

## 🎯 Design Tokens

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary: #2d8341;
  --color-secondary: #60a646;
  --color-accent: #f67f2d;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-heading: 'Barlow', sans-serif;
  --font-body: 'Raleway', sans-serif;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

## 📱 Mobile-Specific Design

### Touch-Friendly Design
- **Minimum Touch Target**: 44px x 44px
- **Spacing**: Generous spacing between interactive elements
- **Gestures**: Support for common mobile gestures
- **Orientation**: Support for both portrait and landscape
- **Performance**: Optimized for mobile performance

### Mobile Navigation
```tsx
// Mobile Menu
<nav className="md:hidden">
  <Button 
    variant="ghost" 
    size="icon"
    className="text-verdeprimario-100"
  >
    <MenuIcon className="w-6 h-6" />
  </Button>
</nav>

// Desktop Navigation
<nav className="hidden md:flex space-x-8">
  <Link href="/">Inicio</Link>
  <Link href="/servicios">Servicios</Link>
  <Link href="/contacto">Contacto</Link>
</nav>
```

## 🎨 Component Library Structure

### Component Categories
1. **Base Components**: Button, Input, Card, etc.
2. **Layout Components**: Header, Footer, Navigation
3. **Feature Components**: ServiceCard, SearchBar, Calendar
4. **Form Components**: FormField, FormGroup, Validation
5. **Feedback Components**: Alert, Toast, Loading
6. **Navigation Components**: Menu, Breadcrumb, Pagination

### Component Documentation
Each component should include:
- **Props Interface**: TypeScript interface
- **Usage Examples**: Code examples
- **Variants**: Different component variants
- **Accessibility**: Accessibility considerations
- **Testing**: Testing guidelines

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
