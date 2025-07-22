# EcoNauts: Renewable Energy Placement & Sustainability Scoring

## Inspiration
Climate change is a pressing global issue. EcoNauts empowers users to make impactful decisions on renewable energy by visualizing and comparing the sustainability of wind and solar energy placements.

---

## What It Does
- **Interactive Map:** Place markers anywhere on the map to simulate wind or solar energy installations.
- **Sustainability Score:** Instantly receive a detailed sustainability score for each marker, based on real-world weather and environmental data.
- **Energy Output Prediction:** Uses machine learning models to predict the energy output for both wind and solar at the selected location.
- **Comparison & Visualization:** View graphs and detailed breakdowns to compare the sustainability and output of different energy sources at your chosen site.

---

## Tech Stack

### Frontend
- **React** (with Vite)
- **Mapbox GL JS** (interactive maps)
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **DaisyUI** (UI components)

### Backend
- **FastAPI** (REST API)
- **Python 3.12**
- **Machine Learning:**
  - RandomForestRegressor (scikit-learn)
  - Artificial Neural Network (TensorFlow)
- **pandas, numpy, joblib** (data processing)
- **Weather APIs:**
  - WeatherAPI
  - Open-Meteo
  - OpenWeatherMap
- **pvlib** (solar calculations)

### DevOps
- **Docker** (containerization)
- **Docker Compose** (multi-service orchestration)

---

## How We Built It
- **Frontend:** Built with React and Mapbox for interactive marker placement. Users can add, drag, and name markers, then calculate energy output and sustainability scores.
- **Backend:** FastAPI serves as the API layer, running ML models for wind and solar prediction. Features are engineered from real-time weather data fetched from multiple APIs.
- **ML Models:**
  - **Wind:** RandomForestRegressor
  - **Solar:** Artificial Neural Network (ANN)
- **Sustainability Score:** Combines predicted output with environmental and economic factors (emissions, land use, water use, cost, scalability) for a holistic score.
- **Dockerized:** Both frontend and backend are containerized for easy deployment and reproducibility.

---

## Challenges We Ran Into
- Integrating Docker with both the frontend and backend, ensuring seamless communication and reproducibility.

## Accomplishments That We're Proud Of
- Successfully rendering the API and using map markers to get real-time sustainability scores.
- End-to-end integration of ML models, weather APIs, and interactive UI.

## What We Learned
- Docker integration for full-stack projects.
- Real-world ML model deployment and API design.

## What's Next for EcoNauts
- UI/UX improvements
- More energy sources and advanced sustainability metrics
- Enhanced data visualization and reporting

---

## Built With
- Docker
- FastAPI
- Mapbox
- Numpy
- Open-Meteo
- Pandas
- React
- Scikit-learn
- Tailwind CSS
- TensorFlow
- WeatherAPI

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started/) & [Docker Compose](https://docs.docker.com/compose/)
- (Optional for local dev) Node.js, Python 3.12, pip

### Quick Start (Recommended)
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd GreenPlacement
   ```
2. **Set up environment variables:**
   - Create a `.env` file in `backend/` with your API keys (WeatherAPI, Open-Meteo, Mapbox, etc.). Example:
     ```env
     WEATHER_API=your_weather_api_key
     OPEN_METEO_API=your_open_meteo_api_key
     MAPBOX_API=your_mapbox_api_key
     ```
3. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)

### Manual Setup (Dev Mode)
#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Usage
- Open the frontend in your browser.
- Place markers on the map to simulate wind or solar installations.
- Click "Calculate Energy Output" to get predictions and sustainability scores.
- View detailed breakdowns and graphs for each marker.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
This project was built for a hackathon by a team of 4. Please contact the authors for reuse or collaboration. 