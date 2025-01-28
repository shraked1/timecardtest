'use client';

import TopNav from '../navigation/TopNav';
import SideNav from '../navigation/SideNav';
import MainHeader from '../header/MainHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50">
        <TopNav />
        <MainHeader />
      </div>
      <div className="flex">
        <main className="flex-1 p-4 mr-16">
          <div className="max-w-[calc(100vw-5rem)]">
            {children}
          </div>
        </main>
        <div className="fixed right-0 top-0 pt-[7.5rem] bottom-0 w-16 bg-emerald-800">
          <SideNav />
        </div>
      </div>
    </div>
  );
} 