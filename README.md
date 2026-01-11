# JobLinkUG: AI-Powered Job Matching Platform for Uganda

![Project Status](https://img.shields.io/badge/Status-Development-orange)
![University](https://img.shields.io/badge/MUBS-Faculty%20of%20Computing-blue)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

## 📖 Project Overview
[cite_start]**JobLinkUG** is a capstone project developed by final-year Business Computing students at **Makerere University Business School**[cite: 1, 8]. The platform addresses the fragmentation in Uganda's labor market by centralizing employment opportunities and leveraging Artificial Intelligence to connect job seekers with legitimate employers.

Unlike traditional job boards, JobLinkUG utilizes **AI Vector Embeddings and Semantic Search** to understand the context of candidate skills and job requirements. [cite_start]This allows for higher-quality matches beyond simple keyword searching, reducing recruitment bias and improving hiring efficiency for both the formal and informal sectors[cite: 74, 87].

---

## 🚀 Key Features
* [cite_start]**AI-Driven Matching:** Semantic recommendation engine using **Vector Embeddings** and Cosine Similarity to score candidate relevance[cite: 89].
* [cite_start]**Employer Verification:** Robust verification workflows to eliminate "ghost jobs" and scams, a critical issue in Uganda's digital recruitment space[cite: 68, 149].
* [cite_start]**Real-Time Notifications:** Instant alerts for new matches and application updates via Inngest[cite: 89].
* [cite_start]**Mobile-First Design:** Fully responsive interface optimized for low-bandwidth environments (average 5-15 Mbps) in urban and semi-urban Uganda[cite: 216].
* [cite_start]**Dual-User Dashboard:** Specialized interfaces for Job Seekers (CV management, application tracking) and Employers (Job posting, candidate scoring)[cite: 209].

---

## 🛠️ Technology Stack
[cite_start]This project follows a modern **Design Science Research (DSR)** approach using the following technologies[cite: 89, 212]:

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14+](https://nextjs.org/) (React & TypeScript) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **Event Handling** | [Inngest](https://www.inngest.com/) |
| **AI Processing** | OpenAI / Gemini API (Embeddings) |
| **Hosting** | [Vercel](https://vercel.com/) |

---

## 👥 The Team
[cite_start]**Project Title:** Developing a JobLink Management Platform for Employees and Employers in Uganda [cite: 2]

[cite_start]**Supervised by:** Miss. Nyesiga Catherine (Department of Applied Computing & IT) [cite: 6, 7]

| Name | Registration Number | Role |
| :--- | :--- | :--- |
| **Wampamba Festo** | 23/U/18503/EVE | Lead Developer / Backend |
| **Grace Kyarikunda Bakeine** | 23/U/10491/PS | Frontend / UI/UX |
| **Kamariza Helena** | 23/U/08844/PS | Research / QA |
| **Kawere Edrine** | 23/U/09440/PS | Database Architect |
| **Talemwa Daniela** | 23/U/17830/EVE | Documentation / Analysis |
[cite_start]*[cite: 4, 12]*

---

## 💻 Getting Started (Local Development)

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/Festo-Wampamba/job-link.git](https://github.com/Festo-Wampamba/job-link.git)
cd job-link