import { Outlet } from "react-router-dom";
import SidebarPerpustakawan from "../components/perpustakawan/SidebarPerpustakawan";

const PerpustakawanLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed h-screen w-64 z-10">
        <SidebarPerpustakawan />
      </div>
      <main className="ml-64 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default PerpustakawanLayout;
