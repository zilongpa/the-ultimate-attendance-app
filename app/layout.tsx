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
import HomeIcon from '@mui/icons-material/Home';
import { NotificationsProvider } from '@toolpad/core/useNotifications';

const BRANDING = {
  title: 'TUAA',
  logo: <img src="/logo.png" alt="TUAA logo" style={{ height: 72 }} />,
  homeUrl: 'https://github.com/zilongpa/the-ultimate-attendance-app'
}

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role = session?.user?.role;
  const NAVIGATION: Navigation = [
    {
      segment: "",
      title: "Home",
      icon: <HomeIcon />,
      pattern: "/",
    },
    {
      segment: "scan",
      title: "Check In",
      icon: <HowToVoteIcon />,
      pattern: "scan",
    },
    {
      segment: "attendance",
      title: "My Attendance",
      icon: <TransferWithinAStationIcon />,
      pattern: "attendance",
    },
    ...(role === "assistant" || role === "professor"
      ? [
        {
          segment: "new-session",
          title: "Create Session",
          icon: <LeaderboardIcon />,
          pattern: "/new-session",
        },
        {
          segment: "class-attendance",
          title: "Class Attendance",
          icon: <BallotIcon />,
          pattern: "/class-attendance",
        },
        {
          segment: "student-attendance",
          title: "Student Attendance",
          icon: <TransferWithinAStationIcon />,
          pattern: "/student-attendance",
        }
      ]
      : []),
    {
      kind: 'divider' as const,
    },
    ...(role === "professor"
      ? [
        {
          segment: 'users',
          title: 'Users',
          icon: <ManageAccountsIcon />,
          pattern: 'users{/:userId}*',
        },
      ]
      : []),
  ];

  return (
    <html suppressHydrationWarning>
      <head>
        <title>{BRANDING.title}</title>
      </head>
      <body>

        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <Suspense fallback={<LinearProgress />}>
              <NotificationsProvider>
                <NextAppProvider
                  navigation={NAVIGATION}
                  branding={BRANDING}
                  session={session}
                  authentication={AUTHENTICATION}
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
