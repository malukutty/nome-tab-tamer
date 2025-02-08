
import UserMenu from "@/components/Auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Nome Tab Tamer</h1>
        </div>
        <UserMenu />
      </div>
    </div>
  );
};

export default Navbar;
