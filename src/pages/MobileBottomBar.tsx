import React from "react";
import { Box, Text } from "@mantine/core";
import {
  IconHome,
  IconTag,
  IconUser,
  IconCalculator
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

// Define the props interface for NavLinkItem
interface NavLinkItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick: (path: string) => void;
}

const MobileBottomNavbar: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
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
      }}
    >
      <NavLinkItem
        icon={<IconHome size={22} />}
        label="Home"
        path="/"
        onClick={handleNavigation}
      />
      <NavLinkItem
        icon={<IconTag size={22} />}
        label="Categories"
        path="/product"
        onClick={handleNavigation}
      />
      <NavLinkItem
        icon={<IconCalculator size={22} />}
        label="Find your fit"
        path="/fit"
        onClick={handleNavigation}
      />
      <NavLinkItem
        icon={<IconUser size={22} />}
        label="Account"
        path="/account"
        onClick={handleNavigation}
      />
    </Box>
  );
};

// Helper component for each navigation item
const NavLinkItem: React.FC<NavLinkItemProps> = ({ icon, label, path, onClick }) => {
  return (
    <div
      onClick={() => onClick(path)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textDecoration: "none",
        padding: "5px",
        color: "#006400", // dark green
        cursor: "pointer",
      }}
    >
      <Box mb={2}>{icon}</Box>
      <Text fz="xs" style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
    </div>
  );
};

export default MobileBottomNavbar;
