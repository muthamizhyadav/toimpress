import { Container, Stack, Text, Title } from "@mantine/core";

export default function AboutUs() {
  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Title order={2}>About Us</Title>
        <Text>
          Welcome to <strong>TO IMPRESS</strong> – where comfort meets confidence.  
          We believe that lingerie and everyday essentials should not only look good,  
          but also feel amazing to wear.
        </Text>
        <Text>
          Our collection features thoughtfully designed <strong>bras, panties, leggings,  
          and more</strong>, crafted with high-quality fabrics that support your lifestyle.  
          Whether you’re looking for everyday comfort or something stylish to feel  
          empowered, we’ve got you covered.
        </Text>
        <Text>
          At <strong>TO IMPRESS</strong>, our mission is simple – to inspire confidence  
          and celebrate individuality, one piece at a time.
        </Text>
        <Text>
          Thank you for choosing us to be a part of your everyday essentials and  
          special moments.
        </Text>
      </Stack>
    </Container>
  );
}
