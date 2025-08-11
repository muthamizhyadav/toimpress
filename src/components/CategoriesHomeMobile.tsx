import { Grid, Card, Text, rem } from '@mantine/core';
import { 
  IconGift, IconShirt, IconBriefcase, IconStar, IconSportBillard, IconBrandAppleArcade, 
  IconMoon, IconBabyCarriage, IconShoppingBag, IconPackages 
} from '@tabler/icons-react';

const categories = [
  { label: 'ELITE', icon: IconStar },
  { label: 'BRA', icon: IconShirt },
  { label: 'PANTIES', icon: IconShirt },
  { label: 'SPORTSWEAR', icon: IconSportBillard },
  { label: 'LINGERIE SET', icon: IconBrandAppleArcade },
  { label: 'NIGHTWEAR', icon: IconMoon },
  { label: 'CAMISOLE & SLIP', icon: IconBriefcase },
  { label: 'SHAPEWEAR', icon: IconShoppingBag },
  { label: 'TEENS', icon: IconBabyCarriage },
  { label: 'ACCESSORIES', icon: IconPackages },
  { label: 'BRANDS', icon: IconShirt },
  { label: 'NEW ARRIVALS', icon: IconGift },
];

export default function CategoriesHomeMobile() {
  return (
    <Grid grow gutter="sm" className="px-4 py-2 my-3" style={{ backgroundColor: '#F3E8D3' }}>
      {categories.map((item) => {
        const IconComponent = item.icon;
        return (
          <Grid.Col span={4} key={item.label}>
            <Card
              shadow="sm"
              radius="md"
              withBorder
              style={{
                textAlign: 'center',
                backgroundColor: '#F0F5F0',
                color: '#122F15',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: rem(100),
              }}
            >
              <IconComponent size={rem(36)} stroke={1.5} />
              <Text size="xs" mt="xs" style={{ fontWeight: "600"  }}  >
                {item.label}
              </Text>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
