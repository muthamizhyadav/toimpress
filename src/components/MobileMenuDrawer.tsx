// MobileMenuDrawer.tsx
import { Drawer, ScrollArea, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

export function UseMobileMenuDrawer() {
  const [opened, { open, close }] = useDisclosure(false);
  return { opened, open, close };
}

export function MobileMenuDrawer({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    // Ensure absolute path
    const fullPath = path.startsWith("/") ? path : `/${path}`;
    navigate(fullPath);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      padding="md"
      size="100%"
      withCloseButton={false}
      transitionProps={{ transition: "slide-right", duration: 250 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={onClose}>
            X
          </Button>
        </div>

        <ScrollArea className="flex-grow md:hidden">
          <div className="flex flex-col gap-4 p-4 text-lg font-medium">
            <button onClick={() => handleNavigation("category?id=1")}>Brassiere</button>
            <button onClick={() => handleNavigation("category?id=2")}>Panties</button>
            <button onClick={() => handleNavigation("category?id=3")}>Shimmer Leggings</button>
            <button onClick={() => handleNavigation("category?id=4")}>New Arrivals</button>
            <button onClick={() => handleNavigation("category?id=5")}>Offers Zone</button>
            <button onClick={() => handleNavigation("category?id=6")}>Combo Offer</button>
            <button onClick={() => handleNavigation("/account")}>My Account</button>
          </div>
        </ScrollArea>
      </div>
    </Drawer>
  );
}
