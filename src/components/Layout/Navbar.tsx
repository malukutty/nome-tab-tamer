
import UserMenu from "@/components/Auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-14 items-center px-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Nome Tab Tamer</h1>
        </div>
        <div className="flex items-center h-full">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
