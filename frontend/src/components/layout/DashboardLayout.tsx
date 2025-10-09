import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  title: string;
}

export const DashboardLayout = ({
  children,
  currentPage,
  onNavigate,
  title,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <TopBar title={title} />
      <main className="ml-64 pt-16">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
