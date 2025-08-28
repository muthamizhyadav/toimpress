import { Container, Stack, Title, List, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export default function SiteMapContent() {
  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Title order={2}>Sitemap</Title>
        <Text c="dimmed" size="sm">
          Explore all important sections of TO IMPRESS.
        </Text>

        <List spacing="sm" size="sm">
          <List.Item>
            <Link to="/">Home</Link>
          </List.Item>

          <List.Item>
            <Link to="/about">About Us</Link>
          </List.Item>

          <List.Item>
            <Link to="/contact">Contact</Link>
          </List.Item>

          <List.Item>
            <Link to="/shop">Shop</Link>
            <List withPadding spacing="xs" size="sm" mt="xs">
              <List.Item>
                <Link to="/shop/bras">Bras</Link>
              </List.Item>
              <List.Item>
                <Link to="/shop/panties">Panties</Link>
              </List.Item>
              <List.Item>
                <Link to="/shop/leggings">Leggings</Link>
              </List.Item>
            </List>
          </List.Item>

          <List.Item>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </List.Item>

          <List.Item>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </List.Item>
        </List>
      </Stack>
    </Container>
  );
}
