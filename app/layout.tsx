// By Junhui Huang
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Suspense } from 'react';
import { Navigation } from '@toolpad/core/AppProvider';
import { auth } from '@/auth';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import BallotIcon from '@mui/icons-material/Ballot';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { NotificationsProvider } from '@toolpad/core/useNotifications';

// Define branding information for the application
const BRANDING = {
  title: 'TUAA',
  // Use a standard HTML img tag for the logo due to compatibility issues with Next.js Image component
  logo: <img src="/logo.png" alt="TUAA logo" style={{ height: 72 }} />,
  homeUrl: 'https://github.com/zilongpa/the-ultimate-attendance-app', // Link to the project's homepage
};

// Define authentication methods for the application
const AUTHENTICATION = {
  signIn, // Sign-in function from next-auth
  signOut, // Sign-out function from next-auth
};

// Root layout component for the application
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch the current session and user role
  const session = await auth();
  const role = session?.user?.role;

  // Define navigation menu items based on user roles
  const NAVIGATION: Navigation = [
    // General navigation items visible to all users
    {
      segment: "scan",
      title: "Check In", // Page for students to check in
      icon: <HowToVoteIcon />,
      pattern: "scan",
    },
    {
      segment: "attendance",
      title: "My Attendance", // Page for students to view their attendance
      icon: <TransferWithinAStationIcon />,
      pattern: "attendance",
    },
    // Additional navigation items for assistants and professors
    ...(role === "assistant" || role === "professor"
      ? [
        {
          kind: 'divider' as const, // Divider for separating sections in the navigation menu
        },
        {
          segment: "new-session",
          title: "Create Session", // Page to create a new session
          icon: <LeaderboardIcon />,
          pattern: "/new-session",
        },
        {
          segment: "sessions",
          title: "Class Attendance", // Page to view class attendance
          icon: <BallotIcon />,
          pattern: "/sessions{/:sessionId}?",
        },
        {
          segment: "attendances",
          title: "Student Attendance", // Page to view individual student attendance
          icon: <TransferWithinAStationIcon />,
          pattern: "attendances{/:userId}?",
        },
      ]
      : []),
    // Additional navigation items exclusive to professors (currently empty)
    ...(role === "professor"
      ? []
      : []),
    {
      kind: 'divider' as const, // Divider for separating sections in the navigation menu
    },
    {
      segment: 'user',
      title: 'My Settings', // Page to manage user name and override role with environment variables
      icon: <ManageAccountsIcon />,
      pattern: 'user',
    },
  ];

  return (
    // Suppress hydration warnings caused by dark mode in Toolpad
    <html suppressHydrationWarning>
      <head>
        <title>{BRANDING.title}</title>
      </head>
      <body>
        {/* Wrap the application with necessary providers */}
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <Suspense fallback={<LinearProgress />}> {/* Show a loading indicator while content is loading */}
              <NotificationsProvider>
                <NextAppProvider
                  navigation={NAVIGATION} // Pass navigation configuration
                  branding={BRANDING} // Pass branding configuration
                  session={session} // Pass user session
                  authentication={AUTHENTICATION} // Pass authentication methods
                >
                  {children}
                </NextAppProvider>
              </NotificationsProvider>
            </Suspense>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
