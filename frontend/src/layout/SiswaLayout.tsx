import { Outlet } from "react-router-dom";
import HeaderSiswa from "../components/siswa/HeaderSiswa";
import FooterSiswa from "../components/siswa/FooterSiswa";

const SiswaLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 ">
      <HeaderSiswa />

      <main className="flex-1 p-4 mt-16">
        <Outlet />
      </main>

      <FooterSiswa />
    </div>
  );
};

export default SiswaLayout;
