
This is a React Native mobile application built with Expo for browsing stocks and managing personal watchlists. The app fetches real-time market data from the [Alpha Vantage API](https://www.alphavantage.co/) and provides a clean, user-friendly interface with both light and dark modes.

## Features

### 📈 Explore Screen
Discover top-gaining and top-losing stocks for the day, presented in horizontally scrolling sections.

### 📋 View All Screen
A paginated view to browse the complete list of top gainers or losers.

### 📊 Stock Details
View detailed information for any stock, including an interactive line chart showing its recent price history.

### 👀 Watchlist Management
- Create and delete multiple, personalized watchlists
- Add stocks to any watchlist directly from their details page via an intuitive modal
- Remove individual stocks from a watchlist or delete entire lists with confirmation

### 🌙 Dynamic Theming
Seamlessly switch between a light and dark theme with a global toggle button available in the header of every screen.

### 🚀 Robust Data Handling
- **API Caching**: Responses from the Alpha Vantage API are cached in AsyncStorage to minimize network requests and improve performance
- **Rate Limit Fallback**: If the live API key reaches its daily limit, the app automatically falls back to a demo API to ensure the details screen remains functional

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based)
- **Language**: TypeScript
- **Styling**: React Native StyleSheet
- **Data Fetching**: Native Fetch API
- **Local Storage**: AsyncStorage for caching and watchlist persistence
- **Charting**: Custom-built using react-native-svg for full control and interactivity
- **Build Service**: Expo Application Services (EAS)

## Project Structure

The project follows a standard Expo Router structure, keeping code organized and scalable.

```
/
├── app/                  # All screens and navigation logic
│   ├── (tabs)/           # Layout and screens for the bottom tabs
│   │   ├── _layout.tsx   # Sets up the bottom tab navigator
│   │   ├── index.tsx     # Explore screen
│   │   └── explore.tsx   # Watchlist screen
│   ├── list/
│   │   └── [type].tsx    # Paginated "View All" screen for gainers/losers
│   ├── stock/
│   │   └── [ticker].tsx  # Stock details screen
│   └── _layout.tsx       # Root layout, theme provider, global header
├── assets/               # Fonts and images
├── components/           # Reusable components (StockCard, LineChart, etc.)
├── constants/            # API keys, mock data
├── context/              # React Context for theming
├── hooks/                # Custom hooks (useWatchlist)
├── utils/                # Utility functions (caching)
└── eas.json              # Expo Application Services build configuration
```

## Getting Started

Follow these instructions to set up and run the project locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo Go](https://expo.dev/client) app on your mobile device (iOS or Android) or an Android Emulator

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-directory>
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up API Key (Environment Variables)

To protect sensitive information like API keys, we use environment variables. This practice prevents secrets from being hardcoded and accidentally committed to version control systems like Git.

#### Step 1: Get Your API Key
Visit the [Alpha Vantage website](https://www.alphavantage.co/support/#api-key) and sign up for a free API key. You'll need to:
1. Go to [Alpha Vantage API Key Request](https://www.alphavantage.co/support/#api-key)
2. Fill out the registration form
3. Verify your email address
4. Copy your API key from the confirmation email or dashboard

#### Step 2: Create the .env File
In the root directory of the project, create a new file named `.env`.

#### Step 3: Add Your API Key
Open the `.env` file and add your API key from Alpha Vantage. For Expo projects, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in your app's code.

```env
EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY="YOUR_API_KEY_HERE"
```

#### Step 4: Secure the .env File
The `.env` file is already listed in the project's `.gitignore` file. This is a critical security step that ensures your secret key will not be uploaded to GitHub.

### 5. Run the Application

Start the Expo development server:

```bash
npx expo start
```

> **Important**: After creating or modifying the `.env` file, you must stop and restart the development server for the changes to take effect.

Scan the QR code with the Expo Go app on your phone to launch the application.

## Building the APK

To generate a standalone APK file for Android, you can use Expo Application Services (EAS).

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Log In

```bash
eas login
```

### 3. Configure the Build

If you haven't already, configure the project for EAS builds:

```bash
eas build:configure
```

Select "All" or "Android" when prompted. This will create an `eas.json` file. Ensure the preview profile is configured to build an APK:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 4. Start the Android Build

Run the following command to start the build process:

```bash
eas build -p android --profile preview
```

EAS will queue the build and provide a link to track its progress. Once complete, you will get a link to download the final APK file.

## API Information

This app uses the [Alpha Vantage API](https://www.alphavantage.co/) for real-time stock market data. Alpha Vantage provides:

- Real-time and historical stock data
- Technical indicators
- Foreign exchange rates
- Cryptocurrency data
- Economic indicators

**API Rate Limits**: The free tier includes 25 API requests per day and 5 API requests per minute. For higher usage, consider upgrading to a [premium plan](https://www.alphavantage.co/premium/).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
- Check the [Alpha Vantage documentation](https://www.alphavantage.co/documentation/)
- Review the [Expo documentation](https://docs.expo.dev/)
- Open an issue in this repository