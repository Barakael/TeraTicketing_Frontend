import React, { useState } from "react";
import {
  User,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Save,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

const SettingsPage: React.FC = () => {
  const { activeTab } = useParams<{ activeTab: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: "Tera Ticketing System",
    supportEmail: "support@company.com",
    maxFileSize: "10",
    sessionTimeout: "30",
    enableNotifications: true,
    enableEmailAlerts: true,
    autoAssignTickets: false,
    requireApproval: true,
  });

  const handleProfileSave = () => {
    console.log("Saving profile:", profileData);
    // Implementation for saving profile
  };

  const handleSystemSave = () => {
    console.log("Saving system settings:", systemSettings);
    // Implementation for saving system settings
  };

  const renderProfileSettings = () => (
    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h2>
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {user?.name}
              </h3>
              <Badge
                variant={
                  user?.role === "admin"
                    ? "danger"
                    : user?.role === "department_leader"
                    ? "warning"
                    : "info"
                }
              >
                {user?.role?.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1  gap-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
            />
            <Input
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
            />
            <Input
              label="Department"
              value={profileData.department}
              onChange={(e) =>
                setProfileData({ ...profileData, department: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={profileData.currentPassword}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  currentPassword: e.target.value,
                })
              }
            />
            <Input
              label="New Password"
              type="password"
              value={profileData.newPassword}
              onChange={(e) =>
                setProfileData({ ...profileData, newPassword: e.target.value })
              }
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h2>
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Dark Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
              <Button
                variant={isDark ? "primary" : "outline"}
                onClick={toggleTheme}
              >
                {isDark ? "Dark" : "Light"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 right-24">
        <Button onClick={handleProfileSave} icon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderPermissionsSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Role Permissions
        </h2>
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {["admin", "department_leader", "troubleshooter"].map((role) => (
              <div
                key={role}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                  {role.replace("_", " ")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "View All Tickets",
                    "Create Tickets",
                    "Edit Tickets",
                    "Delete Tickets",
                    "Manage Users",
                    "View Analytics",
                    "Export Data",
                    "System Settings",
                    "Merge Tickets",
                  ].map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={
                          role === "admin" ||
                          (role === "department_leader" &&
                            ![
                              "Delete Tickets",
                              "Manage Users",
                              "System Settings",
                            ].includes(permission)) ||
                          (role === "troubleshooter" &&
                            [
                              "View All Tickets",
                              "Create Tickets",
                              "Edit Tickets",
                            ].includes(permission))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {permission}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button icon={<Save size={16} />}>Save Permissions</Button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-12 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          General Settings
        </h2>
        <div className="bg-gradient-to-r from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Site Name"
              value={systemSettings.siteName}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  siteName: e.target.value,
                })
              }
            />
            <Input
              label="Support Email"
              type="email"
              value={systemSettings.supportEmail}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  supportEmail: e.target.value,
                })
              }
            />
            <Input
              label="Max File Size (MB)"
              type="number"
              value={systemSettings.maxFileSize}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  maxFileSize: e.target.value,
                })
              }
            />
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={systemSettings.sessionTimeout}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  sessionTimeout: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notification Settings
        </h2>
        <div className="bg-gradient-to-l from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {[
              {
                key: "enableNotifications",
                label: "Enable Push Notifications",
                description: "Receive browser notifications for new tickets",
              },
              {
                key: "enableEmailAlerts",
                label: "Enable Email Alerts",
                description: "Send email notifications for ticket updates",
              },
              {
                key: "autoAssignTickets",
                label: "Auto-assign Tickets",
                description:
                  "Automatically assign tickets to available troubleshooters",
              },
              {
                key: "requireApproval",
                label: "Require Leader Approval",
                description: "Department leaders must approve ticket closures",
              },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {setting.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {setting.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      systemSettings[
                        setting.key as keyof typeof systemSettings
                      ] as boolean
                    }
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        [setting.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed top-20 right-10">
        <Button onClick={handleSystemSave} icon={<Save size={16} />}>
          Save Settings
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    // If no activeTab is specified, default to profile
    if (!activeTab) {
      return renderProfileSettings();
    }

    switch (activeTab) {
      case "profile":
        return renderProfileSettings();
      case "permissions":
        return renderPermissionsSettings();
      case "system":
        return renderSystemSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and system preferences
        </p>
      </div>

      {renderContent()}
    </div>
  );
};

export default SettingsPage;
