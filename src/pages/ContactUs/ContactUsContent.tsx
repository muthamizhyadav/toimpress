import { Container, Grid, Stack, Title, Text, Group, Box } from "@mantine/core";
import { IconPhone, IconMail, IconMapPin } from "@tabler/icons-react";

export default function ContactUsContent() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Contact Us</Title>
        <Text c="dimmed" size="sm">
          Have questions or need assistance? We’d love to hear from you.  
          Reach out to <strong>TO IMPRESS</strong> using the details below.
        </Text>

        <Grid gutter="lg" mt="md">
          {/* Phone */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Box p="md" bg="gray.1" style={{ borderRadius: 8 }}>
              <Group align="flex-start" gap="sm">
                <IconPhone size={24} />
                <Stack gap={2}>
                  <Text fw={500}>Phone</Text>
                  <Text size="sm" c="dimmed">
                    +91 70104 47947
                  </Text>
                </Stack>
              </Group>
            </Box>
          </Grid.Col>

          {/* Email */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Box p="md" bg="gray.1" style={{ borderRadius: 8 }}>
              <Group align="flex-start" gap="sm">
                <IconMail size={24} />
                <Stack gap={2}>
                  <Text fw={500}>Email</Text>
                  <Text size="sm" c="dimmed">
                    30B/10 VANAMOORTHY LINGAMPILLAI STREET, CHETTIYARPATTI, Virudhunagar - 626122, Tamil Nadu.
                  </Text>
                </Stack>
              </Group>
            </Box>
          </Grid.Col>

          {/* Address */}
          {/* <Grid.Col span={{ base: 12, sm: 4 }}>
            <Box p="md" bg="gray.1" style={{ borderRadius: 8 }}>
              <Group align="flex-start" gap="sm">
                <IconMapPin size={24} />
                <Stack gap={2}>
                  <Text fw={500}>Address</Text>
                  <Text size="sm" c="dimmed">
                    TO IMPRESS HQ,  
                    Chennai, India
                  </Text>
                </Stack>
              </Group>
            </Box>
          </Grid.Col> */}
        </Grid>
      </Stack>
    </Container>
  );
}
