# Code Walkthrough Script

**Goal**: Demonstrate React Native expertise with a natural, confident, and conversational delivery.

## 1. Project Overview & Problem Statement
*   **Action**: Start with the simulator open, showing the Home Screen.
*   **Script**: "Hi, I'm Yatharth. I'm excited to walk you through 'Stocks App', a React Native project I built using Expo.
    
    So, the problem I wanted to solve was simple: most stock apps are just too cluttered and heavy. I wanted something lightweight that works even when my internet is spotty.
    
    That's why I built this—it's a fast, offline-first tracker. I used **React Native** and **TypeScript** for the core logic, and **Expo Router** to handle the navigation."

## 2. Code Walkthrough & Architecture
### A. Architecture
*   **Action**: Collapse all folders, then expand `app`, `components`, and `hooks`.
*   **Script**: "Let's dive into the code. I laid this out using a feature-based architecture, which works really well with Expo Router.
    
    You'll see I've separated concerns pretty strictly:
    *   **`app/`** here handles all my routing and pages.
    *   **`hooks/`** is where I keep the heavy business logic—I like keeping my UI components clean and focused just on rendering.
    *   And **`components/`** is for reusable UI bits like the Stock Cards and Charts."

### B. Navigation & Routing Deep Dive
*   **Action**: Open `app/_layout.tsx`.
*   **Script**: "Navigation is really the backbone of the app. In `_layout.tsx`, you can see I'm wrapping everything in a root Stack.
    
    I also wrapped the whole app in my own **`AppThemeProvider`**. This is what lets us toggle that Dark Mode seamlessly across every single screen.
    
    For the routes themselves, I'm leveraging **Dynamic Routing**.
    *   (Open `list/[type].tsx`) So for example, this `list/[type].tsx` file... instead of making separate pages for 'Top Gainers' and 'Top Losers', I just use this one file and check the URL parameter. It reuses the exact same logic, which keeps things DRY.
    *   (Open `+not-found.tsx`) I also added this `+not-found` route. It’s a small detail, but I think good error handling is crucial so users never get stuck on a blank screen if something goes wrong."

### C. State Management & TypeScript
*   **Action**: Open `hooks/useWatchlist.ts`.
*   **Script**: "For state management, let's look at `useWatchlist.ts`.
    
    I'm checking for **referential equality** here. You'll see I wrapped `loadWatchlists` in a `useCallback` hook. I did this to stop infinite re-renders when I use this function inside `useEffect` dependencies in my components.
    
    Also, about TypeScript—(Scroll to `Stock` type)—I defined this central `Stock` type. It acts as the single source of truth for my data schema. It’s like live documentation; it guarantees that my API, my Cards, and my Hooks are all speaking the exact same language."

### D. UI & Performance
*   **Action**: Open `components/LineChart.tsx`.
*   **Script**: "For the chart, I didn't want to use a heavy library that bloats the bundle size. So, I built this `LineChart` from scratch using `react-native-svg`.
    
    To make it interactive, I implemented a `PanResponder`. It calculates the user's touch position to render the tooltip instantly. It feels really 60fps smooth because I'm controlling every pixel myself."

## 3. Challenges & The "Ah-Ha" Moment
*   **Action**: Open `app/utils/cache.ts`.
*   **Script**: "Now, the biggest challenge I faced was actually the API. Alpha Vantage has a strict rate limit of about 25 requests a day on the free tier. When I started, the app would literally stop working after five minutes.
    
    So, I built this custom caching layer here in `cache.ts`.
    
    It’s pretty cool—it wraps every response with a timestamp. Before I make a network request, I check: 'Do we have data? Is it less than 5 minutes old?'
    
    If yes, I serve it instantly from storage. This didn't just solve the API limit—it actually made the app feel 'snappy' and immediate for the user, which was a huge win."

## 4. Technical Debt (Transparency)
*   **Action**: Open `app/(tabs)/index.tsx`.
*   **Script**: "I want to be transparent about what I'd improve if I had more time.
    
    First, while I have a `services/` folder, I invoke `fetch` directly in a few components like this one. In a production app, I’d refactor strictly to a Service Layer to force that caching logic everywhere.
    
    Also, for this demo, I hardcoded the API Key because my local Windows environment handles `.env` files a bit weirdly. Obviously, in production, that would be locked down in `process.env`.
    
    And finally, I'm using simple alerts for errors right now. I'd love to wrap this in a proper **Error Boundary** component to handle crashes more gracefully."

## 5. Deployment & Closing
*   **Script**: "For deployment, I set up a pipeline with **Expo EAS**. It automates building the Android APK, which saves a ton of manual work.
    
    So that's the Stocks App! I really focused on clean architecture, handling those strict API constraints, and making it feel native.
    
    Thanks so much for your time—I’d love to answer any questions!"
