import { Outlet } from "remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header";

export default function questions() {
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
