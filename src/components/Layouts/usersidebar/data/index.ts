import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/users",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "E-KYC Verification",
        url: "/users/ekyc-verification",
        icon: Icons.UserManagementIcon,
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.Settings,
        items: [
          {
            title: "Change Password",
            url: "/users/setting/change-password",
          },
          
        ],
      },
    ],
  },

];
