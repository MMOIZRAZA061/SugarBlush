# updated-sugar

Sugar Blush Bakery - MERN Stack with MongoDB for Vercel deployment

## Project Structure

- `server.js`: Express server for API routes and React build
- `client/`: React client (Vite build)
- `public/`: Legacy static HTML files (not used in production)
- `db/`: MongoDB database models and connection
- `routes/`: API route handlers
- `middleware/`: Express middleware

## Deployment

### Vercel Setup

1. Set environment variables in Vercel Dashboard:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: JWT secret for authentication
   - `CLOUDINARY_URL`: Cloudinary URL for image uploads
   - `NODE_ENV`: production

2. Deploy the project - Vercel will:
   - Build React app using `client/package.json` → `client/dist`
   - Deploy server.js as serverless function
   - Serve static files from `/static` directory

## Database

Uses MongoDB Atlas (serverless-compatible) instead of SQLite

## Build

```bash
# Install dependencies
npm install

# Build React client
cd client && npm run build

# Build server
npm run build
