import { Card, Text, Group } from "@mantine/core";

type GSTCalculatorProps = {
  amount: number;      
  gstPercent: number;    
  includeGST?: boolean;  
};

export default function GSTCalculator({
  amount,
  gstPercent,
  includeGST = false,
}: GSTCalculatorProps) {
  
  const gstRate = gstPercent / 100;
  const basePrice = includeGST ? amount / (1 + gstRate) : amount;
  const gstAmount = basePrice * gstRate;
  const totalAmount = basePrice + gstAmount;

  return (
    <Card shadow="md" radius="md" p="lg" withBorder>
      <Group position="apart">
        <Text fw={600}>Base Price:</Text>
        <Text>₹ {basePrice.toFixed(2)}</Text>
      </Group>

      <Group position="apart">
        <Text fw={600}>GST ({gstPercent}%):</Text>
        <Text>₹ {gstAmount.toFixed(2)}</Text>
      </Group>

      <Group position="apart" mt="sm">
        <Text fw={700} size="lg">Total:</Text>
        <Text fw={700} size="lg">₹ {totalAmount.toFixed(2)}</Text>
      </Group>
    </Card>
  );
}
