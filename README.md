# MeetMii 📱
### Share your world in one scan

MeetMii is a digital contact card app where users create a profile with all their social links, generate a unique QR code, and instantly share their contact info with anyone — no app download required to view.

---

## Demo

| My Card | Analytics | Profile Editor | Settings |
|---|---|---|---|
| QR code full screen | Real-time scan stats | Social links form | Dark/light mode |

> Built and deployed to production on GCP. Live backend available at the Cloud Run URLs below.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                        │
│              (Expo, iOS & Android, Dark/Light Mode)         │
└────────────────────────────┬────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │ User Service│   │Profile Svc  │   │  QR Service │
   │  Port 8001  │   │  Port 8002  │   │  Port 8003  │
   │  Cloud Run  │   │  Cloud Run  │   │  Cloud Run  │
   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
          │                 │                  │
          ▼                 ▼                  │ Pub/Sub
   ┌─────────────┐   ┌─────────────┐          │
   │  Cloud SQL  │   │  Cloud SQL  │          ▼
   │ PostgreSQL  │   │ PostgreSQL  │   ┌─────────────┐
   └─────────────┘   └─────────────┘   │ Analytics   │
                                       │  Port 8004  │
                                       │  Cloud Run  │
                                       └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │   BigQuery  │
                                       │scan_events  │
                                       └─────────────┘
                                              │
                                    Cloud Scheduler (weekly)
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Insights   │
                                       │  Port 8005  │
                                       │  Cloud Run  │
                                       └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  Gemini AI  │
                                       │  Insights   │
                                       └─────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo, Dark/Light Mode |
| Backend | Python, FastAPI |
| Auth | JWT, bcrypt |
| Database | GCP Cloud SQL (PostgreSQL) |
| Analytics | GCP BigQuery |
| Messaging | GCP Pub/Sub |
| Deployment | GCP Cloud Run, Docker |
| Scheduling | GCP Cloud Scheduler |
| AI | Gemini AI (gemini-3-flash-preview) |
| Container Registry | GCP Artifact Registry |

---

## Microservices

### User Service (Port 8001)
Handles registration, login, and JWT authentication.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/` | GET | None | Health check |
| `/users/register` | POST | None | Create account |
| `/users/login` | POST | None | Login, returns JWT |
| `/users/me` | GET | JWT | Get current user |

### Profile Service (Port 8002)
Stores and serves each user's digital contact card.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/profile` | POST | JWT | Create or update profile |
| `/profile/{username}` | GET | None | Public profile (supports `?source=app`) |

### QR Service (Port 8003)
Generates QR code PNG images on demand.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/qr/{username}` | GET | None | Returns QR code PNG image |

### Analytics Service (Port 8004)
Logs scan events to BigQuery and returns scan statistics.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/analytics/scan` | POST | None | Log a scan event |
| `/analytics/{username}/stats` | GET | None | Get scan statistics |

### Insights Service (Port 8005)
Generates personalized weekly networking insights using Gemini AI.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/insights/generate` | POST | None | Generate insights for all users |
| `/insights/{username}` | GET | None | Get latest insight for user |

---

## Event-Driven Architecture

When someone views a public profile the following happens automatically:

```
User views profile
→ Profile Service logs scan to Pub/Sub topic (qr-scanned)
→ Analytics Service receives message via subscription
→ Scan event written to BigQuery (scan_events table)
→ Stats update in real time
→ Every Sunday: Cloud Scheduler triggers Insights Service
→ Gemini AI generates personalized insight from BigQuery data
→ Insight stored in BigQuery (weekly_insights table)
→ User sees insight in Analytics screen
```

The QR and Analytics services are fully decoupled — if Analytics goes down, scans queue in Pub/Sub and get processed when it recovers.

---

## Mobile App Features

- **Register / Login** — JWT authentication with bcrypt password hashing
- **My Card** — Full screen QR code with share and copy link buttons
- **Profile Editor** — Fill in social links (Instagram, TikTok, Snapchat, Twitter, LinkedIn, email, website)
- **Professional Mode** — Toggle to only show LinkedIn and email to viewers
- **Scanner** — Camera QR code scanner that opens scanned profiles
- **Profile View** — Tappable social links that open the respective apps
- **Analytics** — Real-time scan stats from BigQuery + Gemini AI weekly insight
- **Settings** — Dark/light mode toggle, display name, profile link sharing, logout

---

## Local Development

### Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 18+
- Expo Go app on your phone
- GCP account with BigQuery and Pub/Sub enabled

### Setup

1. Clone the repo:
```bash
git clone https://github.com/yourusername/MeetMii.git
cd MeetMii
```

2. Create a `.env` file in the root:
```env
DATABASE_URL=postgresql://postgres:password@db:5432/meetmii
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
GCP_PROJECT_ID=your_gcp_project_id
BIGQUERY_DATASET_ID=meetmii_analytics
PUBSUB_TOPIC_NAME=qr-scanned
PUBSUB_SUBSCRIPTION_NAME=analytics-subscription
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
```

3. Start all backend services:
```bash
docker-compose up --build
```

4. Start the mobile app:
```bash
cd mobile
npx expo start --tunnel
```

5. Scan the QR code with Expo Go on your phone.

### Service URLs (Local)
- User Service: http://localhost:8001
- Profile Service: http://localhost:8002
- QR Service: http://localhost:8003
- Analytics Service: http://localhost:8004
- Insights Service: http://localhost:8005

---

## Production URLs (GCP Cloud Run)

| Service | URL |
|---|---|
| User Service | https://user-service-661768391098.us-central1.run.app |
| Profile Service | https://profile-service-661768391098.us-central1.run.app |
| QR Service | https://qr-service-661768391098.us-central1.run.app |
| Analytics Service | https://analytics-service-661768391098.us-central1.run.app |
| Insights Service | https://insights-service-661768391098.us-central1.run.app |

---

## Deployment

Each service is containerized and deployed to GCP Cloud Run using:

```bash
# Build for linux/amd64 (required for Cloud Run from Apple Silicon)
docker buildx build --platform linux/amd64 \
  -t us-central1-docker.pkg.dev/PROJECT_ID/meetmii-repo/SERVICE:latest \
  ./SERVICE --push

# Deploy to Cloud Run
gcloud run deploy SERVICE \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/meetmii-repo/SERVICE:latest \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --project=PROJECT_ID
```

---

## Key Design Decisions

**Why microservices?**
Each service can be scaled, deployed, and updated independently. If the analytics service goes down the QR code generation and profile viewing still work perfectly.

**Why Pub/Sub instead of direct service calls?**
Loose coupling. The QR/Profile service publishes an event and moves on. It doesn't care if Analytics is up or down. Messages queue automatically and get processed when the service recovers.

**Why BigQuery for analytics instead of PostgreSQL?**
BigQuery is optimized for analytical queries — counting, aggregating, and grouping large datasets. Scan events are append-only and queried in bulk, which is exactly BigQuery's strength.

**Why the `?source=app` parameter?**
Internal app requests to load profile data would otherwise count as scans, inflating analytics. The source parameter distinguishes internal traffic from real external profile views.

---

## Project Structure

```
MeetMii/
├── user_service/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── requirements.txt
│   └── Dockerfile
├── profile_service/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── pubsub_publisher.py
│   ├── requirements.txt
│   └── Dockerfile
├── qr_service/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── analytics_service/
│   ├── main.py
│   ├── schemas.py
│   ├── bigquery_client.py
│   ├── pubsub_subscriber.py
│   ├── requirements.txt
│   └── Dockerfile
├── insights_service/
│   ├── main.py
│   ├── bigquery_client.py
│   ├── gemini_client.py
│   ├── requirements.txt
│   └── Dockerfile
├── mobile/
│   ├── App.js
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   └── context/
│   └── package.json
├── docker-compose.yml
└── .env
```

---

## Author

Ashwin Aggarwal — Cornell University