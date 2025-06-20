# Restaurant Menu Application

A full-stack web application for displaying restaurant menus with a modern, responsive design.

## Tech Stack

- **Frontend**: Next.js 15.3.0 with React 19.0.0
- **Styling**: TailwindCSS v4
- **Backend**: Django 5.2 with Django REST Framework
- **Database**: SQLite3

## Quick Start

### Prerequisites
- Node.js (for frontend)
- Python 3.x (for backend)

### Frontend Setup
```bash
cd frontend/
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend/
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend API will be available at `http://127.0.0.1:8000`

### Admin Panel
Create a superuser to access the Django admin panel:
```bash
cd backend/
python manage.py createsuperuser
```
Access admin at `http://127.0.0.1:8000/admin/`

## Features

- **Responsive Design**: Mobile-friendly interface
- **Hierarchical Menu**: Categories ’ Subcategories ’ Items
- **Image Support**: Upload and display item images
- **Item Details**: Pop-up view for menu items
- **Admin Interface**: Easy content management through Django admin

## API Endpoints

- `GET /api/menu/` - Retrieve complete menu hierarchy
- `/admin/` - Django admin interface
- `/media/` - Uploaded images

## Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Backend:**
- `python manage.py runserver` - Start Django server
- `python manage.py migrate` - Apply database migrations
- `python manage.py collectstatic` - Collect static files