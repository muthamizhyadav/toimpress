import { Card, Grid, Text, Avatar, Group, rem } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

const reviews = [
  { name: "Baijayantibala Panda", initials: "BP", days: "3 days ago", review: "FABRIC AND FITTING IS SO WELL" },
  { name: "Aathira Cho", initials: "AC", days: "4 days ago", review: "The fabric is good, comfortable and also the customer care support is also commendable." },
  { name: "Divya Sundar", initials: "DS", days: "5 days ago", review: "Nice products" },
  { name: "Neelu Designs", initials: "ND", days: "6 days ago", review: "Nice pricing" },
  { name: "Arrthi Arrthi", initials: "AA", days: "6 days ago", review: "It was very beautiful and value for the money. Quality also too good. I love this product" },
  { name: "Anonymous", initials: "AN", days: "7 days ago", review: "As a plus size person who considers comfortable bras, kindly consider shyaway product without second thought. Believe me or not high coverage bra saviour for life." },
  { name: "Kowsalya Balaji", initials: "KB", days: "1 week ago", review: "Good quality, very comfort." },
  { name: "Smilee Panithi", initials: "SP", days: "1 week ago", review: "The product is very good, and the quality was soo good." },
  { name: "Boomiga Samaraj", initials: "BS", days: "1 week ago", review: "The products was really good and the quality undoubtedly awesome." },
  { name: "Amani Kudaravalli", initials: "AK", days: "1 week ago", review: "One stop for comfort" },
  { name: "Lalitha Palanivel", initials: "LP", days: "1 week ago", review: "Very good response and explanation" },
  { name: "Tarmin Shaikh", initials: "TS", days: "1 week ago", review: "Mashallah" },
  { name: "Sulochana Arjunan", initials: "SA", days: "1 week ago", review: "Good" },
  { name: "Mr. Manoj Gouda", initials: "MG", days: "1 week ago", review: "Good" },
];

export default function Reviews() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      style={{
        width: isMobile ? 'calc(100% - 30px)' : '70vw',
        margin: isMobile ? '15px' : '0 auto',
      }}
    >
      {/* Header */}
      <Card radius="md" p="md" mb="md" shadow="sm" style={{ backgroundColor: '#F5F5F5' }}>
        <Group position="apart" mb="xs">
          <Text size="xl" fw={700} color="#EA4335">Google</Text>
          <Text size="md" fw={600}>Rating</Text>
        </Group>
        <Group>
          <Text fw={700} size="lg">4.6</Text>
          <Group spacing={2}>
            {[...Array(4)].map((_, i) => (
              <IconStarFilled key={i} size={18} color="#EA4335" />
            ))}
            <IconStarFilled size={18} color="#EA4335" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </Group>
          <Text size="sm" color="gray">4096 reviews</Text>
        </Group>
      </Card>

      {/* Review Cards */}
      <Grid gutter="md">
        {reviews.map((item, index) => (
          <Grid.Col span={{ base: 6, md: 3 }} key={index}>
            <Card radius="lg" shadow="sm" p="sm" style={{ backgroundColor: '#F5F5F5', position: 'relative' }}>
              {/* Stars */}
              <Group spacing={2} mb="xs">
                {[...Array(5)].map((_, i) => (
                  <IconStarFilled key={i} size={16} color="#133215" />
                ))}
              </Group>

              {/* Review Text */}
              <Text size="sm" mb="md">{item.review}</Text>

              {/* Cloud Bubble Name */}
              <Group spacing="xs">
                <Avatar radius="xl" color="green" style={{ backgroundColor: '#133215', color: 'white' }}>
                  {item.initials}
                </Avatar>
                <Card
                  radius="xl"
                  p="xs"
                  style={{
                    backgroundColor: '#92B775',
                    color: '#133215',
                    display: 'inline-block',
                    borderRadius: '20px',
                    position: 'relative',
                    fontSize: rem(12),
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                  <div
                    style={{
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '-8px',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderRight: '8px solid #92B775',
                    }}
                  />
                </Card>
              </Group>

              {/* Days Ago */}
              <Text size="xs" color="gray" mt="xs">
                {item.days}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
}
