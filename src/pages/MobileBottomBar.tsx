import React from "react";
import { Box, Text, rem, useMantineTheme } from "@mantine/core";
import {
  IconHome,
  IconUser,
  IconCalculator,
  IconCube
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";

// Define the props interface for NavLinkItem
interface NavLinkItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick: (path: string) => void;
  active?: boolean;
}

const MobileBottomNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => navigate(path);

 const isActive = (path: string) => {
  if (path === "/") {
    return (
      location.pathname === "/" ||
      location.pathname.startsWith("/product") ||
      location.pathname.startsWith("/category")
    );
  }
  return location.pathname.startsWith(path);
};


  return (
    <Box
      hiddenFrom="md"
      p="xs"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "60px",
        backgroundColor: "white",
        borderTop: "1px solid #e0e0e0",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px))",
      }}
    >
      <NavLinkItem
        icon={<IconHome size={22} />}
        label="Home"
        path="/"
        onClick={handleNavigation}
        active={isActive("/")}
      />
      <NavLinkItem
        icon={<IconCube size={22} />}
        label="Orders"
        path="/orders"
        onClick={handleNavigation}
        active={isActive("/orders")}
      />
      <NavLinkItem
        icon={<IconCalculator size={22} />}
        label="Find your fit"
        path="/fit"
        onClick={handleNavigation}
        active={isActive("/fit")}
      />
      <NavLinkItem
        icon={<IconUser size={22} />}
        label="Account"
        path="/account"
        onClick={handleNavigation}
        active={isActive("/account")}
      />
    </Box>
  );
};

// Helper component for each navigation item
const NavLinkItem: React.FC<NavLinkItemProps> = ({ icon, label, path, onClick, active }) => {
  const theme = useMantineTheme();

  const activeBg = theme.colors.green?.[0] ?? "#f0fff0";
  const activeColor = theme.colors.green?.[9] ?? "#0f2a12";
  const inactiveColor = "#006400";

  return (
    <button
      onClick={() => onClick(path)}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textDecoration: "none",
        padding: rem(6),
        cursor: "pointer",
        border: 0,
        background: active ? activeBg : "transparent",
        borderRadius: rem(8),
        transition: "background-color 250ms ease, color 120ms ease",
        color: active ? activeColor : inactiveColor,
      }}
    >
      <Box mb={2} style={{ lineHeight: 0, color: active ? activeColor : inactiveColor }}>
        {icon}
      </Box>
      <Text fz="xs" style={{ whiteSpace: "nowrap", color: active ? activeColor : inactiveColor }}>
        {label}
      </Text>
    </button>
  );
};

export default MobileBottomNavbar;