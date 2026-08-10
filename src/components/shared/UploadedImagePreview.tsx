import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Box, Button, Image, Modal } from "@mantine/core";
import { IconDownload, IconZoomIn } from "@tabler/icons-react";
import type { CSSProperties } from "react";

const extractFileName = (url: string) =>
  decodeURIComponent(url.split("/").pop()?.split("?")[0] || "image.jpg");

const downloadImage = async (url: string, fileName?: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName || extractFileName(url);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Image download failed", err);
    window.open(url, "_blank");
  }
};

type Props = {
  src: string;
  h?: number;
  alt?: string;
  fileName?: string;
  style?: CSSProperties;
};

export default function UploadedImagePreview({
  src,
  h = 100,
  alt = "Uploaded image",
  fileName,
  style,
}: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Box
        style={{
          position: "relative",
          borderRadius: "var(--mantine-radius-md)",
          overflow: "hidden",
          cursor: "zoom-in",
          ...style,
        }}
        onClick={open}
      >
        <Image src={src} alt={alt} h={h} radius="md" fit="cover" w="100%" />
        <ActionIcon
          variant="filled"
          color="dark"
          size="sm"
          radius="xl"
          aria-label="Download image"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 1,
            opacity: 0.85,
          }}
          onClick={(e) => {
            e.stopPropagation();
            downloadImage(src, fileName);
          }}
        >
          <IconDownload size={14} />
        </ActionIcon>
        <ActionIcon
          variant="filled"
          color="dark"
          size="sm"
          radius="xl"
          aria-label="Preview image"
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            zIndex: 1,
            opacity: 0.85,
          }}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
        >
          <IconZoomIn size={14} />
        </ActionIcon>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        centered
        withCloseButton
        size="lg"
        padding="md"
        title="Image Preview"
      >
        <Image src={src} alt={alt} fit="contain" mah={500} mx="auto" />
        <Button
          fullWidth
          mt="md"
          variant="outline"
          leftSection={<IconDownload size={16} />}
          onClick={() => downloadImage(src, fileName)}
        >
          Download Image
        </Button>
      </Modal>
    </>
  );
}