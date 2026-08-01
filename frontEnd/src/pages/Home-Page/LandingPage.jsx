import React from 'react'
import Hero from '../../component/Hero'
import OurPolicy from '../../component/OurPolicy'
import DestopCategrory from '@/component/DestopCategrory'
import NewArrivals from './NewArrivals'
import BestSellers from './BestSellers'
import ProductList from '../ProductList'
import Footer from '@/component/Footer'
const LandingPage = () => {
  return (
    <div className="w-full">
      <Hero />
      <div className='pl-4 pr-4'>
         <DestopCategrory />
         <NewArrivals />
         <BestSellers />
         <ProductList category="phones" linkTo="/phones" />
         <ProductList category="fridge" linkTo="/fridge" />
         <ProductList category="washing machine" linkTo="/washing-machines" />
         <ProductList category="laptops" linkTo="/laptops"/>
         <ProductList category="television" linkTo="/television"/>
         <ProductList category="Accessories " linkTo="/accessories" />
        <OurPolicy />
       
      </div>
      <div>
         <Footer/>
      </div>
    </div>
  )
}

export default LandingPage
