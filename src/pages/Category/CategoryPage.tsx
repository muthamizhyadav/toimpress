import Header from '../../components/Header';
import ProductGrid, { Product } from '../../components/ProductGrid';
import SmallHeader from '../../components/SmallHeader';
import BraModel from "../../../src/assets/svg/braModel.svg";
import Footer from '../Home/Footer';
import MobileBottomNavbar from '../MobileBottomBar';


const mockFetchProducts = async (offset: number, limit: number): Promise<Product[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Array.from({ length: limit }, (_, i) => ({
    id: offset + i,
    title: 'Susie Secret Side Bra',
    price: 999,
    originalPrice: 1349,
    imageUrl: BraModel,
    discount: 26,
    isNew: (offset + i) % 2 === 0,
  }));
};

export default function CategoryPage() {
  return(
    <>
     <SmallHeader />
      <Header />
      <ProductGrid fetchProducts={mockFetchProducts} />
      <Footer />
      <MobileBottomNavbar />      
    </>
  )
}
