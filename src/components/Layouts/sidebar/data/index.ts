import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Manage Users",
        url: "/manage-users",
        icon: Icons.UserManagementIcon,
        items: [],
      },
      {
        title: "Manage Branches",
        url: "/manage-branches",
        icon: Icons.BranchIcon,
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.Settings,
        items: [
          {
            title: "API Credentials",
            url: "/settings/api-credentials",
          },
          {
            title: "PDF Note",
            url: "/settings/pdf-note",
          },
          {
            title: "Service Log",
            url: "/settings/service-log",
          },
        ],
      },
    ],
  },

];
