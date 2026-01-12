# WorkConnectUG: AI-Powered Job Matching Platform for Uganda

![Project Status](https://img.shields.io/badge/Status-Development-orange)
![University](https://img.shields.io/badge/MUBS-Faculty%20of%20Computing-blue)
![License](https://img.shields.io/badge/License-Apache%202.0-purple)

## 📖 Project Overview

**WorkConnectUG** is a capstone project developed by final-year Business Computing students at **Makerere University Business School**. The platform addresses the fragmentation in Uganda's labor market by centralizing employment opportunities and leveraging Artificial Intelligence to connect job seekers with legitimate employers.

Unlike traditional job boards, WorkConnectUG utilizes **AI Vector Embeddings and Semantic Search** to understand the context of candidate skills and job requirements. This allows for higher-quality matches beyond simple keyword searching, reducing recruitment bias and improving hiring efficiency for both the formal and informal sectors.

---

## 🚀 Key Features

- **AI-Driven Matching:** Semantic recommendation engine using **Vector Embeddings** and Cosine Similarity to score candidate relevance.
- **Employer Verification:** Robust verification workflows to eliminate "ghost jobs" and scams, a critical issue in Uganda's digital recruitment space.
- **Real-Time Notifications:** Instant alerts for new matches and application updates via Inngest.
- **Mobile-First Design:** Fully responsive interface optimized for low-bandwidth environments (average 5-15 Mbps) in urban and semi-urban Uganda.
- **Dual-User Dashboard:** Specialized interfaces for Job Seekers (CV management, application tracking) and Employers (Job posting, candidate scoring).

---

## 🛠️ Technology Stack

This project follows a modern **Design Science Research (DSR)** approach using the following technologies:

| Category           | Technology                                              |
| :----------------- | :------------------------------------------------------ |
| **Framework**      | [Next.js 14+](https://nextjs.org/) (React & TypeScript) |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/)                |
| **Database**       | [PostgreSQL](https://www.postgresql.org/)               |
| **ORM**            | [Drizzle ORM](https://orm.drizzle.team/)                |
| **Authentication** | [Clerk](https://clerk.com/)                             |
| **Event Handling** | [Inngest](https://www.inngest.com/)                     |
| **AI Processing**  | OpenAI / Gemini API (Embeddings)                        |
| **Hosting**        | [Vercel](https://vercel.com/)                           |

---

## 👥 The Team

**Project Title:** Developing a WorkConnect Management Platform for Employees and Employers in Uganda

**Supervised by:** Ms. Nyesiga Catherine (Department of Applied Computing & IT)

| Name                         | Registration Number | Role                     |
| :--------------------------- | :------------------ | :----------------------- |
| **Wampamba Festo**           | 23/U/18503/EVE      | Lead Developer / Backend |
| **Grace Kyarikunda Bakeine** | 23/U/10491/PS       | Frontend / UI/UX         |
| **Kamariza Helena**          | 23/U/08844/PS       | Research / QA            |
| **Kawere Edrine**            | 23/U/09440/PS       | Database Architect       |
| **Talemwa Daniela**          | 23/U/17830/EVE      | Documentation / Analysis |

---

## 💻 Getting Started (Local Development)

Follow these instructions to set up the project locally on your machine.

### 1. Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18 or later)
- **pnpm** (Package Manager) - _Install via `npm install -g pnpm`_
- **Docker Desktop** (For running the PostgreSQL database)
- **Git**

### 2. Clone the repository

Download the code to your local machine:

```bash
git clone https://github.com/Festo-Wampamba/work-connect-ug.git
cd work-connect-ug
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` and update the database credentials if needed.
