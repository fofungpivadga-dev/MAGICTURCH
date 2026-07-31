import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CursorBackground from './CursorBackground';
import RibbonBackground from './RibbonBackground';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <CursorBackground />
      <RibbonBackground />
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
