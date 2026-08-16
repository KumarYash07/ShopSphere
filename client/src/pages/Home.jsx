import MainLayout from '../components/layout/MainLayout';
import HeroCarousel from '../components/home/HeroCarousel';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FlashSale from '../components/home/FlashSale';
import { TrendingProducts, BestSellers, NewArrivals, TodayDeals } from '../components/home/ProductSections';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <MainLayout>
      <div style={{ paddingBottom: 80 }}>
        <HeroCarousel />
        <FeaturedCategories />
        <FlashSale />
        <TrendingProducts />
        <TodayDeals />
        <BestSellers />
        <NewArrivals />
        <Newsletter />
      </div>
    </MainLayout>
  );
}
