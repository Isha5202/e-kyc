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
        title: "Manage User",
        url: "/manage-user",
        icon: Icons.UserManagementIcon,
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
            title: "Balance",
            url: "/settings/balance",
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
