import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar tetap (fixed) */}
      <div className="fixed h-screen w-64 z-10">
        <SidebarAdmin />
      </div>

      <main className="ml-64 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
