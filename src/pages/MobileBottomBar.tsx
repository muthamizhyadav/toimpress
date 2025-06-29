// src/components/MobileBottomNavbar.tsx
import React from "react";
import { AppShell, Anchor, Box, Text } from "@mantine/core";
import { IconApps, IconTag, IconUser } from "@tabler/icons-react";

// Define the props interface for NavLinkItem
interface NavLinkItemProps {
  icon: React.ReactNode; // React.ReactNode is good for any valid JSX element (like an icon component)
  label: string;
  href: string;
}

const MobileBottomNavbar: React.FC = () => {
  return (
    <AppShell.Footer
      hiddenFrom="md"
      p="xs"
      withBorder
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "60px",
        backgroundColor: "white", // Keeping background white as in your image
        zIndex: 1000,
      }}
    >
      <NavLinkItem icon={<IconApps size={22} />} label="Products" href="#" />
      <NavLinkItem icon={<IconTag size={22} />} label="Offers" href="#" />
      {/* Assuming IconUser is a placeholder, you might want a more specific icon for "Find your fit" */}
      <NavLinkItem
        icon={<IconUser size={22} />} // Consider changing this icon to something more descriptive if available
        label="Find your fit"
        href="#"
      />
      <NavLinkItem icon={<IconUser size={22} />} label="Account" href="#" />
    </AppShell.Footer>
  );
};

// Helper component for each navigation item with TypeScript props
const NavLinkItem: React.FC<NavLinkItemProps> = ({ icon, label, href }) => {
  return (
    <Anchor
      href={href}
      fz="xs"
      c="darkGreen.9" // Using the darkest shade of our custom 'darkGreen' color
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textDecoration: "none",
        padding: "5px",
      }}
    >
      <Box mb={2}>{icon}</Box>
      <Text style={{ whiteSpace: "nowrap" }}>{label}</Text>
    </Anchor>
  );
};

export default MobileBottomNavbar;
