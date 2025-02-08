
import { Settings as SettingsIcon } from "lucide-react";
import TabOrganizer from "@/components/Browser/TabOrganizer";
import Navbar from "@/components/Layout/Navbar";

const Settings = () => {
  return (
    <div className="flex flex-col h-screen bg-white animate-fade-in">
      <Navbar />
      <div className="flex-1 bg-nome-50 p-4 overflow-y-auto">
        <div className="w-full bg-white rounded-lg shadow-sm p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Tab Organization</h2>
              <TabOrganizer />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
