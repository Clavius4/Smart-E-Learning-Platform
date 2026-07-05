import IconifyIcon from 'components/base/IconifyIcon';
import { TopProduct } from 'types/dashboard';
import { Stack, Link, Card, Rating, CardMedia, Typography } from '@mui/material';

interface ProductCardProps {
  data: TopProduct;
}

const ProductCard = ({ data }: ProductCardProps) => {
  return (
    <Card>
      <Stack alignItems="center" justifyContent="space-between">
        <Stack spacing={2} alignItems="center" minWidth={190}>
          <CardMedia
            component="img"
            src={data.image}
            sx={{ height: 100, width: 100 }}
            alt="product_img"
          />
          <div>
            <Typography
              component={Link}
              href={data.link}
              variant="body1"
              color="text.primary"
              fontWeight={500}
              display="block"
              mb={0.75}
            >
              {data.title}
            </Typography>
            <Rating
              name="half-rating-read"
              size="small"
              defaultValue={data.rating}
              icon={<IconifyIcon icon="iconamoon:star-fill" />}
              emptyIcon={<IconifyIcon icon="iconamoon:star-fill" />}
              precision={1}
              readOnly
            />
            <Typography
              variant="body1"
              color="text.primary"
              fontWeight={700}
              display="block"
              mt={0.5}
            >
              {data.price}
            </Typography>
          </div>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ProductCard;
