"use client";

import Link from "next/link";
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, MenuItem } from "@mui/material";

export default function Header() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const manageAttendance = <MenuItem onClick={handleClose} component={Link} href="/manage">Manage Attendance</MenuItem>;
    const attendanceCodes = <MenuItem onClick={handleClose} component={Link} href="/printer">Attendance Codes</MenuItem>;
    const scanner = <MenuItem onClick={handleClose} component={Link} href="/scan">Scanner</MenuItem>;

    const menuItems = [];
    if (session?.user) {
        if (session.user?.role.includes("ADMIN")) {
            menuItems.push(manageAttendance);
            menuItems.push(attendanceCodes);
        } else if (session.user?.role.includes("FACULTY")) {
            menuItems.push(manageAttendance);
            menuItems.push(attendanceCodes);
        } else {
            menuItems.push(scanner);
        }
    }

    if (isLoading) {
        // 避免 hydration mismatch，session 加载中时只渲染 loading
        return (
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            CS391 Attendance
                        </Typography>
                        <Button color="inherit" disabled>
                            Loading...
                        </Button>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }

    return (
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={handleMenuClick}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        {menuItems.length === 0 ? (
                            <MenuItem onClick={handleClose} component={Typography}>Please login first.</MenuItem>
                        ) : (
                            menuItems.map((item) => item)
                        )}
                    </Menu>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        CS391 Attendance
                    </Typography>
                    {session ?
                        <Button
                            onClick={() => signOut()}
                            color="inherit"
                        >
                            Logout
                        </Button>
                        :
                        <Button
                            onClick={() => signIn("google")}
                            color="inherit"
                        >
                            Login
                        </Button>
                    }
                </Toolbar>
            </AppBar>
        </div>
    );

    // return (
    //     // <HeaderContainer>
    //     <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
    //         <h1 className="text-xl font-bold">Welcome, {session.user?.name}</h1>
    //         <nav>
    //             <ul className="flex space-x-4">
    //                 <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
    //                 <li><a href="/profile" className="hover:underline">Profile</a></li>
    //                 <li><a href="/settings" className="hover:underline">Settings</a></li>
    //             </ul>
    //         </nav>
    //     </header>
    //     // </HeaderContainer>

    // );
}