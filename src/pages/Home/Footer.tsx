import { Box, Container, Flex, Grid, Group, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconPhone, IconMail } from "@tabler/icons-react";
import Logo from "../../../public/logo.png"

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear > 2025 ? currentYear : 2026;

  return (
    <Box bg="gray.1" pt="xl" pb="70px">
      <Container size="xl">
        {/* Top section with logo & contact */}
        <Grid gutter="xl">
          {/* Left: Logo & Contact */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <img
                src={Logo}
                alt="Company Logo"
                className="md:w-[106px] md:h-[65px] w-[80px] h-[50px]"
              />

              <Group gap="md" mt="sm">
                <Group gap={6}>
                  <IconPhone size={18} />
                  <Text size="sm">
                    <strong>+91 8124732811</strong>
                  </Text>
                </Group>
                <Group gap={6}>
                  <IconMail size={18} />
                  <Text size="sm">
                    <strong>innovaturetechenginneers@gmail.com</strong>
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Bottom Bar */}
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          mt="xl"
          pt="md"
          style={{ borderTop: "1px solid #e9ecef" }}
        >
          <Group gap="lg" mt="sm">
            <Text size="xs" c="dimmed">
              <Link to="/about">About us</Link>
            </Text>
            <Text size="xs" c="dimmed">
              <Link to="/contact">Contact</Link>
            </Text>
            <Text size="xs" c="dimmed">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Text>
            <Text size="xs" c="dimmed">
              <Link to="/sitemap">Sitemap</Link>
            </Text>
            <Text size="xs" c="dimmed">
              <Link to="/terms-and-conditions">Terms & Conditions</Link>
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt="sm">
            © {endYear}, All Rights Reserved
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
