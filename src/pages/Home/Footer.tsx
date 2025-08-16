import { Box, Container, Flex, Grid, Group, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconPrinter,
} from "@tabler/icons-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const endYear = currentYear > 2025 ? currentYear : 2026;

  return (
    <Box bg="gray.1" pt="xl" pb="70px">
      <Container size="xl">
        {/* Top section with logo & contact */}
        <Grid gutter="xl">
          {/* Left: Logo & Description */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack>
              <img
                src="logo.png"
                alt=""
                srcSet=""
                className="md:w-[106px] md:h-[65px] w-[80px] h-[50px]"
              />
              <Text c="dimmed" size="sm">
                We ara a lorem ipsum dolor sit amet, consectetur adipiscing
                elit, sed do eiusmod tempor incididunt ut labore exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Text>
              <Group gap="md" mt="sm">
                <Group gap={6}>
                  <IconPhone size={18} />
                  <Text size="sm">
                    <strong>310–437–2766</strong>
                  </Text>
                </Group>
                <Group gap={6}>
                  <IconMail size={18} />
                  <Text size="sm">
                    <strong>unreal@outlook.com</strong>
                  </Text>
                </Group>
              </Group>
              <Group gap="md">
                <Group gap={6}>
                  <IconMapPin size={18} />
                  <Text size="sm">
                    <strong>706 Campfire Ave. Meriden, CT 06450</strong>
                  </Text>
                </Group>
                <Group gap={6}>
                  <IconPrinter size={18} />
                  <Text size="sm">
                    <strong>+1–000–0000</strong>
                  </Text>
                </Group>
              </Group>
            </Stack>
          </Grid.Col>

          {/* Right: Footer Links */}
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
            © {startYear}–{endYear}, All Rights Reserved
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
