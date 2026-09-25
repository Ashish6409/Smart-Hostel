# 🚀 Smart Hostel Management System (HostelOS)

> An end-to-end intelligent hostel management platform combining relational database architecture with real-time decision engines: **Smart Room Allocation**, **NLP AI Complaint Routing**, **Mess Demand ML Prediction**, **Predictive Maintenance Alerts**, **QR Gate Security**, and **Smart Fee Management**.

---

## 🌟 The 7 Intelligent Pillars

### 1. Smart Room Allocation
* **Student Lifestyle Vector**: Study schedule (*Night Owl*, *Early Bird*, *Flexible*), Bedtime (*10 PM – 2:30 AM*), Cleanliness level (1–5 Stars), Noise & Social tolerance (*Quiet*, *Moderate*, *Social*), AC preference, and Floor choice.
* **Compatibility Scoring Algorithm**: Multi-factor Euclidean & weighted similarity producing a 0–100% compatibility score.
* **Warden Recommendation Studio**: Instead of manual searches, Wardens receive ranked room and roommate candidate suggestions with detailed harmony explanations and 1-click allocation.
* **Interactive Vector Tester**: Real-time side-by-side simulator to test compatibility between any two student profiles.

### 2. AI Complaint Management & Auto-Routing
* **Natural Language Issue Parser**: Submit unstructured complaints (e.g., *"AC in room A-104 isn't cooling and making loud rattling noise"* or *"Sparks coming from socket in B-201"*).
* **Live Extraction Card**: Real-time extraction preview showing:
  - **Category**: `HVAC/AC`, `Plumbing`, `Electrical`, `WiFi/Network`, `Carpentry`, `Housekeeping`.
  - **Urgency / Priority**: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
  - **Location / Room**: Auto-extracted entity (e.g. `A-104`, `B-201`).
* **Auto-Routing Dispatch**: Automatically routes the ticket to the domain technician (e.g. Suresh for HVAC/Electrical, Rajesh for Plumbing) based on active backlog.

### 3. Mess Demand Prediction (Python ML Microservice + Fallback)
* **Trained ML Model**: `RandomForestRegressor` ($R^2 = 0.963$ test score) trained on 540 historical meal logs taking day-of-week seasonality, active approved leaves, and exam periods into account.
* **Actionable Outputs**:
  - **Expected Headcount**: e.g., 420–440 meals
  - **Previous Benchmark Average**: 465 meals
  - **Recommended Preparation**: 430–450 meals (includes adaptive 2.5% safety buffer)
  - **Estimated Waste Reduction**: Projected kg of excess food saved and cost reduction.
* **Student Leave Integration**: Students submit weekend leave passes with one click, which instantly deducts their meal headcount from tomorrow's kitchen order.

### 4. Predictive Maintenance Alert System
* **30-Day Rolling Pattern Recognition**: Aggregates complaint frequency per room and asset category.
* **Chronic Breakdown Warning**: When $\ge 3$ complaints occur within 30 days:
  ```
  A-104 → HVAC/AC → 4 complaints → 30 days
  ⚠️ Maintenance Alert: AC in A-104 has repeated failures (MTBF: 7.3 days). Consider preventive inspection or unit replacement.
  ```
* **MTBF & Diagnostic Guidance**: Computes Mean Time Between Failures and generates actionable technical recommendations.

### 5. Smart Security & Digital QR Visitor Passes
* **Digital Pre-Registration**: Visitor/student files visit details (Name, Phone, Purpose, Expected In/Out).
* **Cryptographic QR Code Pass**: Generates high-density QR code pass for gate scanning.
* **Security Guard Terminal**: Guard inputs pass code or scans QR token to stamp instant Entry (Check-In) and Exit (Check-Out) timestamps.
* **Active On-Campus Roster**: Real-time roster tracking duration inside and triggering red **Overstay Alerts** for visitors remaining past curfew.

### 6. Smart Fee Management
* **Itemized Billing**: Base Room Rent + Mess Fee + Amenities Deposit.
* **Dynamic Late Fine Calculation**: Automatically charges daily late fees on overdue balances.
* **Online Payment Simulator**: Instant checkout with simulated transaction ID and downloadable printable receipts.
* **Admin Collection Analytics**: Total billed, total collected, overdue balance, and collection rate %.

### 7. Executive Analytics & Real-Time Insights
* Real-time insights engine highlighting:
  - 🔔 *2 rooms have repeated maintenance complaints requiring preventive inspection.*
  - 📊 *Block A occupancy reached 94%.*
  - 🍱 *Tuesday dinner demand is consistently lower than preparation by ~45 meals.*

---

## 🏛️ System Architecture

```
                    SMART HOSTEL SYSTEM
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
     Student             Warden             Admin
        │                  │                  │
        └──────────── Web/Mobile UI ──────────┘
             (React + Tailwind CSS + Recharts)
                           │
                     REST API / JSON
                           │
                    Node.js / Express
                           │
        ┌──────────────────┼─────────────────────────┐
        │                  │                         │
 SQLite (Prisma)     Smart Engine          Python ML Service
 Users, Rooms,     • Room Allocation     (FastAPI + scikit-learn)
 Complaints,       • NLP Triage          RandomForestRegressor
 Meals, Passes     • Predictive Maint.   /predict (Port 8001)
```

---

## ⚡ Quick Start Instructions

### 1. Launch All Services Simultaneously (Windows Batch)
Double-click `start.bat` in the project root:
```cmd
start.bat
```
This automatically launches:
1. **Node.js Backend**: `http://localhost:5000`
2. **React Frontend**: `http://localhost:3000`
3. **Python ML FastAPI Engine**: `http://localhost:8001`

---

### 2. Manual Startup (Individual Terminals)

#### Backend (Node.js + Prisma SQLite)
```bash
cd server
npm install
npm run prisma:seed    # Pre-seeds rooms, 4 AC complaints in A-104, 21d mess logs
npm run dev            # Starts on http://localhost:5000
```

#### Frontend (React + Vite + Tailwind)
```bash
cd client
npm install
npm run dev            # Starts on http://localhost:3000
```

#### Python ML Service (FastAPI + scikit-learn)
```bash
cd ml_service
py train_model.py      # Generates dataset & trains RandomForest model
py -m uvicorn app:app --port 8001 --reload
```

---

## 🎭 Pre-Configured Demo Personas

Switch between all roles with one click using the top navbar:

| Persona | Name | Role | Test Focus |
|---|---|---|---|
| **Student** | Rahul Sharma | `STUDENT` | Resident of A-104 (AC complaints), submit NLP complaints, meal leaves, pay fee invoices |
| **Warden / Admin** | Dr. Arthur Vance | `ADMIN` / `WARDEN` | Room Allocation Queue, Predictive Maintenance Alerts, Executive Analytics |
| **Security Guard** | Ramesh Singh | `SECURITY` | QR pass verification, gate check-in/out, live campus overstay monitor |
| **Technician** | Suresh Kumar | `STAFF` | HVAC & Electrical specialist, resolve auto-assigned tickets |

---

## 🧪 Testing Scenarios

1. **Test AI Complaint Auto-Routing**:
   - In Student portal, type: *"AC in room A-104 isn't working and making loud rattling noise"*.
   - Watch the live AI badge detect **HVAC/AC**, **Medium Priority**, **Room A-104**, and auto-assign technician **Suresh Kumar**.
2. **Test Predictive Maintenance Alert**:
   - Go to **Predictive Maintenance** tab.
   - Observe the alert: `⚠️ Maintenance Alert: HVAC/AC in A-104 has 4 complaints in 30 days (MTBF: 7.3 days)`.
3. **Test Mess Demand ML Engine**:
   - Go to **Mess ML Forecast** tab.
   - Switch between **Tuesday Dinner** and **Saturday Breakfast**.
   - Notice the expected headcount vs historical average and estimated kg waste saved.
4. **Test QR Security & Overstay**:
   - In **Smart Security** tab, switch to **Gate Guard Terminal**.
   - Click the test button for `VP-OVERSTAY` or `VP-QR9910` to test instant verification and entry/exit stamping.
