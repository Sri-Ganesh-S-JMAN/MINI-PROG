# IT Helpdesk System - Project Documentation

Welcome to the **IT Helpdesk System**! This documentation is written specifically to help beginners understand how the whole project works, what technologies we used, and how the different puzzle pieces (modules) fit together.

This was a mini-project built by a team of 6 interns from different backgrounds. We divided the work into 6 distinct modules. Let's walk through it step-by-step!

---

##  The Tech Stack (What We Used & Why)

Before diving into the modules, you need to know the core tools we used to build this:

1. **Next.js (App Router) & React**: This is the core framework for building the user interface (UI) and the backend API routes all in one place.
2. **TypeScript**: It's like JavaScript but with "types". It helps catch errors before the code even runs, making the app much more reliable.
3. **Tailwind CSS**: A styling tool that lets us design modern, beautiful user interfaces very quickly without writing massive CSS files.
4. **Prisma ORM**: A tool that makes it incredibly easy to talk to our database. Instead of writing raw SQL queries, we write JavaScript/TypeScript to fetch and save data.
5. **PostgreSQL**: The relational database used to store all our users, tickets, assets, etc.
6. **JWT (JSON Web Tokens)**: Used for securely logging in users and remembering who they are across page reloads.
7. **Docker & Azure**: Used to package our app and deploy it to the cloud so anyone can access it.

---

##  General Code Flow (How Data Moves)

When a user interacts with the app, the flow generally goes like this:

1. **Frontend (UI)**: The user clicks a button in a React component (e.g., inside `src/app/(admin)/dashboard/page.tsx`).
2. **API Call**: The frontend sends a request to our backend Next.js API route (`src/app/api/.../route.ts`).
3. **Database (Prisma)**: The backend API uses Prisma (`prisma.xxxx.findMany()`) to talk to the PostgreSQL database.
4. **Response**: The database sends data back to the API, which sends it back to the Frontend to display.

---

##  The 6 Core Modules

Here is a breakdown of the 6 modules, who worked on them, and how they function.

### 1. Dashboard & Integration (Gaurav's Module)
This is the central hub of the app. Once a user logs in, they see a dashboard that summarizes what's happening.
- **What it does**: Displays activity feeds, statistic cards (like "Total Open Tickets"), and handles the main layout (sidebar, navigation) that wraps around all other pages.
- **Where to find the code**: 
  - Layout & Pages: `src/app/(admin)/layout.tsx`, `src/app/(admin)/dashboard/`
  - Components: `src/components/dashboard/StatCard.tsx`, `src/components/dashboard/ActivityFeed.tsx`
- **How it works**: It fetches summary data from various API endpoints and renders them in beautiful UI components. It serves as the "glue" integrating the other modules together visually.

### 2.  Login & Authentication
This module ensures only authorized people can use the system and sees the right data based on their role (Employee vs. Admin/Manager).
- **What it does**: Takes an email and password, checks if they match the database, and gives the user a "Ticket" (JWT Token) for access.
- **Where to find the code**:
  - API Routes: `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`
  - Protection Logic: `src/middleware.ts` 
- **How it works**: `middleware.ts` is the bouncer. On every page visit, it checks if the user has a valid JWT token. If they are an Employee trying to view an Admin page (like `/dashboard`), it redirects them back where they belong!

### 3.  Tickets with SLA (Service Level Agreement)
The core IT Support feature. When an employee's computer breaks, they raise a ticket here.
- **What it does**: Allows users to create, view, and comment on support tickets. It tracks priority and deadlines (SLA hours).
- **Where to find the code**:
  - Prisma Schema: `Ticket` and `TicketComment` models in `prisma/schema.prisma`
  - Routes: `src/app/(admin)/tickets`, `src/app/api/tickets`
- **How it works**: Users submit a form to create a Ticket. An IT agent is assigned. Based on Priority (e.g., High), an SLA Deadline is automatically calculated. Agents and users can communicate via internal or external ticket comments.

### 4. 💻 Assets (IT Resources Inventory)
Every company needs to track its physical resources: laptops, monitors, keyboards.
- **What it does**: Acts as a digital inventory. Tracks what assets exist, their serial numbers, and who currently has them.
- **Where to find the code**:
  - Prisma Schema: `Asset` and `AssetAllocation` models
  - Routes: `src/app/(admin)/assets`
- **How it works**: IT admins can add new assets into the system. When an employee receives a laptop, the system records an `AssetAllocation`, updating the asset's status from `AVAILABLE` to `ALLOCATED`.

### 5.  Asset Approvals
Employees can't just take a laptop; they have to request it, and a manager/admin must approve it.
- **What it does**: A workflow system for handling hardware requests.
- **Where to find the code**:
  - Prisma Schema: `AssetRequest` and `Approval` models
  - Routes: `src/app/(admin)/approvals`, `src/app/api/approvals`
- **How it works**: An employee submits an `AssetRequest` with a reason. It goes into a `PENDING` state. A Manager logs in, reviews the request, and clicks "Approve" (creates an `Approval` record). Finally, an Admin allocates the item.

### 6.  DevOps (CI/CD, Docker, Azure, ACR)
This module gets the code from our laptops onto the live internet where actual users can access it.
- **What it does**: Automates the testing, building, and deployment processes using the cloud.
- **Where to find the code**:
  - `Dockerfile`: Instructions for packaging our code into an isolated box (container).
  - `azure-pipelines.yml`: Azure configuration for building and pushing the container.
  - `Jenkinsfile`: An alternative CI/CD script used for automation pipelines.
- **How it works**: Whenever someone merges code into the `main` branch, Azure Pipelines automatically builds a new `Docker` image containing our Next.js app. It then pushes this image to Azure Container Registry (ACR), and the live server gets updated!


This is a Next.js project bootstrapped with create-next-app.

Getting Started
First, run the development server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.

Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.
Learn Next.js - an interactive Next.js tutorial.
You can check out the Next.js GitHub repository - your feedback and contributions are welcome!

Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out our Next.js deployment documentation for more details.