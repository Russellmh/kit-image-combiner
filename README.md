# Kit Image Combiner

A web application that fetches product images and combines them into customizable kit displays.

## Features

- 📝 **Manual Entry**: Enter up to 6 part numbers manually
- 📊 **CSV Upload**: Process multiple kits from CSV files
- 🎨 **Multiple Layouts**: Grid, horizontal, vertical arrangements
- 📱 **Responsive Design**: Works on desktop and mobile
- 💾 **Batch Download**: Download all processed images at once

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript application
- **Backend**: Node.js Express server that fetches images from RS Online
- **Deployment**: Hosted on Render.com

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
Open `frontend/index.html` in your browser or serve with a local server.

## Deployment URLs

- Frontend: `https://your-frontend-app.onrender.com`
- Backend: `https://your-backend-app.onrender.com`

## Usage

1. Choose processing mode (Manual or CSV)
2. Enter part numbers or upload CSV file
3. Configure layout and dimensions
4. Process and download combined images

## CSV Format

| Master Part | Component 1 | Component 2 | Component 3 | Component 4 | Component 5 | Component 6 |
|-------------|-------------|-------------|-------------|-------------|-------------|-------------|
| KIT-001     | PART-001    | PART-002    | PART-003    |             |             |             |
| KIT-002     | PART-004    | PART-005    | PART-006    | PART-007    |             |             |