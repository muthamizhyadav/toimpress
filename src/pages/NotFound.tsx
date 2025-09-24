import { Container, Stack, Text, Title, Button, Group } from "@mantine/core";
import { IconSearchOff, IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SmallHeader from "../components/SmallHeader";
import Footer from "./Home/Footer";
import FooterCourier from "./Home/FooterCourier";
import SubscriptionBanner from "./Home/SuscriptionBanner";
import MobileBottomNavbar from "./MobileBottomBar";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[100vh]">
      <SmallHeader />
      <Header />
      <Container size="sm" py={80} style={{ textAlign: "center" }}>
        <Stack align="center">
          <IconSearchOff size={64} stroke={1.5} color="#868e96" />
          <Title order={1} size="3rem">
            404
          </Title>
          <Text color="dimmed" size="lg">
            Oops! The page you're looking for doesn't exist.
          </Text>
          <Group>
            <Button
              leftSection={<IconArrowLeft size={18} />}
              variant="light"
              color="blue"
              onClick={() => navigate("/")}
            >
              Go back home
            </Button>
          </Group>
        </Stack>
      </Container>
      <FooterCourier />
      {/* <SubscriptionBanner /> */}
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
