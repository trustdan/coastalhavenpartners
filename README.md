# Full Send Emails

Full Send Emails is an AI-powered email outreach platform designed to create outbound emails that read like warm, personal introductions. This repository contains the landing page and frontend application for the service.

## 🚀 Project Overview

The website showcases the platform's ability to leverage AI for crafting personalized email outreach. It features a modern, high-performance UI built with the latest web technologies, emphasizing smooth animations and user engagement.

### Key Features
- **AI-Powered Research:** Automatically analyzes online presence and industry insights.
- **Smart Vetting:** Quality-over-quantity approach to ensure relevant recipients.
- **Analytics:** Real-time tracking of opens, clicks, and responses.
- **Deliverability:** Built-in configuration for SPF, DKIM, and DMARC.

## 🛠️ Tech Stack

This project is a monorepo managed with [Turbo](https://turbo.build/) and built using:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation:** Framer Motion & Motion
- **UI Library:** [Magic UI](https://magicui.design/) & [Shadcn/UI](https://ui.shadcn.com/)

## ✨ Magic UI Integration

This project heavily utilizes **[Magic UI](https://magicui.design/)** to create a polished and interactive user experience. Below are the key Magic UI components implemented:

- **Hero Section:**
  - `<Meteors />`: Creates a dynamic background effect with falling meteors.
  - `<AnimatedShinyText />`: Adds a shimmering light effect to the main headline ("Outbound that reads like...").
  - `<AuroraText />`: Gives the subtitle an ethereal, color-shifting gradient effect.
  - `<ShimmerButton />`: An attention-grabbing CTA button with a moving shine animation.

- **Features Section:**
  - `<ShineBorder />`: Adds a rotating shine effect to the borders of feature cards, highlighting them on hover.
  - `<TextAnimate />`: Animates the section title ("Why Choose Us") into view.

- **How It Works Section:**
  - `<AnimatedBeam />`: Connects the process steps (Research → Personalize → Deliver) with a flowing, gradient beam animation.

- **Tech Stack Section:**
  - `<IconCloud />`: Displays an interactive 3D cloud of logos (AI partners and tools) that responds to cursor movement.
  - `<TextAnimate />`: Reveals the "Powered by Cutting-Edge AI" heading.

- **Header:**
  - `<AnimatedThemeToggler />`: A smooth, animated switch for toggling between light and dark modes.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v22+)
- pnpm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Full-Stack-Emails
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

To start the development server (using Turbo):

```bash
pnpm dev
```

This will start the `apps/www` application. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

```bash
pnpm build
```

