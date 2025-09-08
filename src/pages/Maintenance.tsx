import React from "react";
import { Container, Card, Text, Center } from "@mantine/core";

const Maintenance = () => (
  <Container size="xs" py={80}>
    <Card shadow="md" radius="lg" p={40} withBorder>
      <Center>
        <Text size="xl" fw={700} color="darkGreen.7" mb={20}>
          Site Under Maintenance
        </Text>
      </Center>
      <Text size="md" align="center" color="gray.7">
        We are currently performing scheduled maintenance.<br />
        We will be back soon. Thank you for your patience!
      </Text>
    </Card>
  </Container>
);

export default Maintenance;
