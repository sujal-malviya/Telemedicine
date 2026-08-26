import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, User, Calendar, ClipboardList, LogOut } from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/patient/dashboard",
    icon: Home,
    roles: ["patient"],
  },
  { name: "Doctors", href: "/patient/doctors", icon: User, roles: ["patient"] },
  {
    name: "History",
    href: "/patient/history",
    icon: ClipboardList,
    roles: ["patient"],
  },
  {
    name: "Appointments",
    href: "/doctor/dashboard",
    icon: Calendar,
    roles: ["doctor"],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = pathname.startsWith("/doctor") ? "doctor" : "patient";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <nav className="bg-white shadow-xl w-72 flex flex-col border-r border-gray-200">
        <div className="p-6">
          <Link href="/" className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-800 transition duration-300">
            TeleMed
          </Link>
        </div>
        <ul className="flex-1 px-4 space-y-4">
          {navigation
            .filter((item) => item.roles.includes(role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                    } flex items-center px-6 py-3 rounded-md transition-all duration-300 ease-in-out`}
                  >
                    <Icon className="h-6 w-6 mr-3" />
                    <span className="text-lg">{item.name}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
        <div className="p-6">
          <Button
            variant="outline"
            className="w-full bg-red-600 text-white hover:bg-red-700 rounded-lg transition duration-300"
            asChild
          >
            <Link href="/login" className="flex items-center justify-center">
              <LogOut className="mr-3 h-5 w-5" /> Logout
            </Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        <div className="max-w-full mx-auto bg-white p-6 rounded-lg shadow-xl">{children}</div>
      </main>
    </div>
  );
}
