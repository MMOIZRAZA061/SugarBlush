# SugarBlush

Sugar Blush Bakery - A full-stack e-commerce application built with MERN stack (MongoDB, Express, React, Node.js).

## Features

- 🛒 Product catalog with categories
- 🛍️ Shopping cart functionality
- 👤 User authentication & profiles
- 📦 Order management
- 🎨 Admin dashboard
- 📊 Analytics & reports
- 🎟️ Coupon system
- 📝 Custom orders
- 📧 Contact form

## Tech Stack

- **Frontend**: React 18, Vite, Bootstrap 5
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: Session-based with bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### Installation

```bash
# Clone the repository
git clone https://github.com/MMOIZRAZA061/SugarBlush.git
cd SugarBlush

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Set up environment variables
# Create a .env file with your MongoDB connection string
echo "MONGODB_URI=your_mongodb_connection_string" > .env
```

### Running in Development

```bash
# Start the backend server
npm run dev

# In another terminal, start the frontend
cd client
npm run dev
```

### Building for Production

```bash
# Build the React client
cd client
npm run build
cd ..

# Start the production server
npm start
```

## Deployment

### Vercel

This project is configured for Vercel deployment.

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set the environment variable `MONGODB_URI` with your MongoDB Atlas connection string
4. Deploy!

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |

## Admin Access

Default admin credentials:
- **Email**: admin@bakery.com
- **Password**: admin123

⚠️ **Important**: Change these credentials after deployment!

## Project Structure

```
sugar-blush/
├── client/           # React frontend
│   ├── src/
│   │   ├── api/      # API client
│   │   ├── components/  # Reusable components
│   │   ├── context/  # React contexts
│   │   ├── pages/    # Page components
│   │   └── styles/   # CSS styles
│   └── package.json
├── db/               # Database models & helpers
├── public/           # Static files & uploads
├── routes/           # Express API routes
├── server.js         # Express server entry point
├── vercel.json       # Vercel configuration
└── package.json
```

## API Endpoints

- `/api/auth` - Authentication
- `/api/products` - Product management
- `/api/cart` - Shopping cart
- `/api/orders` - Order management
- `/api/categories` - Categories
- `/api/banners` - Banners
- `/api/announcements` - Announcements
- `/api/custom-orders` - Custom orders
- `/api/contact` - Contact messages
- `/api/users` - User management
- `/api/stock` - Stock management
- `/api/reports` - Reports
- `/api/settings` - Site settings
- `/api/coupons` - Coupons

## License

MIT
