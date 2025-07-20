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
    navigate(path);
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
        <ScrollArea className="flex-grow">
          <div className="flex flex-col gap-4 p-4 text-lg font-medium">
            <button onClick={() => handleNavigation("/brassiere")}>Brassiere</button>
            <button onClick={() => handleNavigation("/panties")}>Panties</button>
            <button onClick={() => handleNavigation("/leggings")}>Shimmer Leggings</button>
            <button onClick={() => handleNavigation("/account")}>My Account</button>
          </div>
        </ScrollArea>
      </div>
    </Drawer>
  );
}
