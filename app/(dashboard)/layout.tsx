// By Junhui Huang
import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

// This component wraps the dashboard pages with a layout that includes a collapsible sidebar.
export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
    return (
        <DashboardLayout defaultSidebarCollapsed>
            {props.children}
        </DashboardLayout>
    );
}
