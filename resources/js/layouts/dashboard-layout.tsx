import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { PropsWithChildren } from 'react';
import DashboardHeader from '@/components/dashboard/dashboard-header';
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar';

export default function DashboardLayout({ children }: PropsWithChildren) {
    const [sidebarOpen, { toggle, close }] = useDisclosure(false);

    return (
        <Box className="dashboard-shell">
            {sidebarOpen && (
                <button
                    type="button"
                    className="dashboard-overlay"
                    aria-label="Đóng menu"
                    onClick={close}
                />
            )}

            <DashboardSidebar opened={sidebarOpen} onNavigate={close} />

            <div className="dashboard-main">
                <DashboardHeader onToggleSidebar={toggle} />
                <main className="dashboard-content">
                    <div className="dashboard-card">{children}</div>
                </main>
            </div>
        </Box>
    );
}
