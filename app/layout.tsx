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

const BRANDING = {
  title: 'The Ultimate Attendance App',
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
      segment: "checkin",
      title: "Check In",
      icon: <HowToVoteIcon />,
      pattern: "checkin",
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
          pattern: "campaigns/1/ballots",
        },
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
              <NextAppProvider
                navigation={NAVIGATION}
                branding={BRANDING}
                session={session}
                authentication={AUTHENTICATION}
              >
                {children}
              </NextAppProvider>
            </Suspense>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
