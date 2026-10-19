import { Container, Stack, Typography } from "@mui/material";

const pages = {
  shipping: {
    title: "Shipping Rates",
    paragraphs: [
      "Standard shipping is $5.99.",
      "Shipping is free on orders of $30 or more.",
      "Orders are packed within two business days. Most deliveries arrive within 3–5 business days after they ship.",
      "You can review anything you've bought from Your Orders once the order is placed."
    ]
  },
  returns: {
    title: "Returns & Replacements",
    paragraphs: [
      "Unused items can be returned within 30 days of delivery.",
      "Open the order from Your Orders and keep the order number handy when you start a return. Refunds go back to the original payment method after the return is received.",
      "A replacement is sent when the original item arrives damaged or is missing from the shipment."
    ]
  },
  privacy: {
    title: "Privacy Policy",
    paragraphs: [
      "Expressive Cart stores your account details, saved cart, and orders so you can check out and look up what you've bought.",
      "A session cookie keeps you signed in on this device. We don't sell your personal information."
    ]
  },
  terms: {
    title: "Terms of Service",
    paragraphs: [
      "Prices on the product pages are shown in dollars. Placing an order means you agree to pay the total shown at checkout.",
      "Shipping and returns follow the policies linked from the footer. Product availability can change with stock."
    ]
  }
} as const;

export type InfoPageKey = keyof typeof pages;

const InfoPage = ({ page }: { page: InfoPageKey }) => {
  const content = pages[page];

  return (
    <Container maxWidth="md" sx={{ py: 6, flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{content.title}</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        {content.paragraphs.map((paragraph) => (
          <Typography key={paragraph} variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {paragraph}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
};

export default InfoPage;
