// By Junhui Huang
import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
    return (
        <DashboardLayout defaultSidebarCollapsed>
            {props.children}
        </DashboardLayout>
    );
}
