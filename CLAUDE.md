# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack restaurant menu application with separate frontend and backend:

- **Frontend**: Next.js 15.3.0 with React 19.0.0, TailwindCSS v4, App Router
- **Backend**: Django 5.2 with Django REST Framework, SQLite database
- **Communication**: REST API with CORS enabled for cross-origin requests

## Development Commands

### Frontend (Next.js)
```bash
cd frontend/
npm run dev          # Start development server with Turbopack
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (Django)
```bash
cd backend/
python manage.py runserver        # Start Django development server (127.0.0.1:8000)
python manage.py migrate          # Apply database migrations
python manage.py createsuperuser  # Create admin user
python manage.py collectstatic    # Collect static files
```

## Key Architecture Patterns

### Database Schema
Hierarchical menu structure: **Category → SubCategory → Item**
- Categories contain multiple subcategories
- Subcategories contain multiple items with images, prices, descriptions

### API Structure
- Base API URL: `http://127.0.0.1:8000/api/`
- Main endpoint: `/api/menu/` returns complete hierarchical menu data
- Admin panel: `/admin/` for content management
- Media files: `/media/items/` for uploaded images

### Frontend Structure
- Uses Next.js App Router with `src/app/` directory
- Components in `src/app/components/` for reusable UI elements
- Constants in `src/app/constants/` for configuration
- Route-based pages: `/` (homepage), `/items` (menu display)

### Key Files
- `frontend/src/app/page.js` - Homepage with hero, story, people, location sections
- `frontend/src/app/items/page.js` - Menu items display with category navigation
- `backend/api/models.py` - Database models for Category, SubCategory, Item
- `backend/api/views.py` - API endpoints and business logic
- `backend/api/serializers.py` - Data serialization for REST API

### Styling System
- TailwindCSS v4 with custom configuration
- Montserrat font family configured in tailwind.config.js
- Responsive design patterns throughout components

## Development Environment

### Default Ports
- Frontend: `localhost:3000`
- Backend: `127.0.0.1:8000`

### Testing
No testing framework currently configured. ESLint provides code quality checks for frontend.

### Media Handling
Images uploaded through Django admin are stored in `backend/media/items/` and served at `/media/` URL path.