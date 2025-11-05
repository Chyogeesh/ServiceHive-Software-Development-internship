# SlotSwapper - Peer-to-Peer Time Slot Scheduling

SlotSwapper is a full-stack web application that enables users to manage their calendars and swap time slots with others through a marketplace system. Users can mark events as "swappable," browse available slots from other users, and request/respond to swap offers.

## 🎯 Features

### Core Features
- **User Authentication**: JWT-based signup/login system
- **Calendar Management**: CRUD operations for personal events
- **Swap Marketplace**: Browse and request swaps for available time slots
- **Swap Logic**: Complex backend logic for creating, managing, and processing swap requests
- **Real-time State Management**: Frontend updates without page refreshes
- **Protected Routes**: Authentication guards for sensitive pages

### Technical Highlights
- **Backend**: Node.js + Express + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + React Router + Axios
- **State Management**: React Context API
- **Database**: PostgreSQL with proper schema design
- **API Design**: RESTful endpoints with comprehensive error handling

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, React Router, Axios, CSS Modules |
| **Backend** | Node.js, Express, TypeORM, PostgreSQL, JWT |
| **Database** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose |
| **Testing** | Jest (backend unit tests) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)
- PostgreSQL (if running without Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd slotswapper

