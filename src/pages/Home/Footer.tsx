import React from "react";
import {
  Box,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Anchor,
  Divider,
  Image,
} from "@mantine/core";
import { IconPhone, IconMail, IconLocation } from "@tabler/icons-react";
import Logo from "../../../public/logo.png"



export default function Footer() {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear > 2025 ? currentYear : 2026;

  return (
    <Box bg="#FBFBF9" pt="48px" pb="72px" sx={{ borderTop: "1px solid #E9ECEF" }}>
      <Container size="xl">
        {/* Top grid: logo / about / contact */}
        <Grid gutter="xl" align="start">
          <Grid.Col xs={12} md={4}>
            <Stack spacing="sm">
              <Group align="center" spacing="sm">
                {/* Use public path so CRA / Vite serve it from root */}
                 <img
                    src={Logo}
                    alt="Company Logo"
                    className="md:w-[106px] md:h-[65px] w-[80px] h-[50px]"
                  />
                <div>
                  <Text weight={700} size="sm">To Impress</Text>
                  <Text size="xs" color="dimmed">by Ponpreatha Textiles</Text>
                </div>
              </Group>

              <Text size="sm" color="dimmed" mt="xs">
                Quality innerwear crafted with comfort and style — designed in India.
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col xs={12} md={4}>
            <Stack spacing="xs">
              <Text weight={700} size="sm">Contact</Text>

              <Group spacing="sm" align="flex-start" noWrap>
                <IconPhone size={18} aria-hidden />
                <div>
                  <Anchor component="a" href="tel:+917010447947" style={{ display: "block" }}>
                    <Text weight={600} size="sm">+91 70104 47947</Text>
                  </Anchor>
                  <Text size="xs" color="dimmed">Mon — Sun, 9:30 AM — 6:30 PM</Text>
                </div>
              </Group>

              <Group spacing="sm" align="flex-start" noWrap>
                <IconMail size={18} aria-hidden />
                <div>
                  <Anchor component="a" href="mailto:info@toimpress.in" style={{ display: "block" }}>
                    <Text weight={600} size="sm"> toimpress.sales@gmail.com </Text>
                  </Anchor>
                  <Text size="xs" color="dimmed">We reply within 24 hours</Text>
                </div>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col xs={12} md={4}>
            <Stack spacing="xs">
              <Text weight={700} size="sm">Visit Us</Text>

              <Group spacing="sm" align="flex-start" noWrap>
                <IconLocation size={18} aria-hidden />
                <div>
                  <Anchor
                    component="a"
                    href="https://www.google.com/maps/search/?api=1&query=30B%2F10+VANAMOORTHY+LINGAMPILLAI+STREET+CHETTIYARPATTI+Virudhunagar+626122"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open address in Google Maps"
                    style={{ display: "block" }}
                  >
                    <Text weight={600} size="sm">
                      30B/10 Vanamoorthy Lingampillai St, Chettiyarpatti
                    </Text>
                  </Anchor>
                  <Text size="xs" color="dimmed">
                    Virudhunagar - 626122, Tamil Nadu
                  </Text>
                </div>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider my="xl" />

        {/* Bottom row */}
        <Group position="apart" align="center" spacing="xl" noWrap mb={2} >
          <Text size="xs" color="dimmed">
            © {endYear} To Impress by Ponpreatha Textiles. All rights reserved.
          </Text>
        </Group>
      </Container>
    </Box>
  );
}