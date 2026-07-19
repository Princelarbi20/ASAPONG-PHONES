import React from 'react'
import Hero from '../../component/Hero'
import OurPolicy from '../../component/OurPolicy'
import DestopCategrory from '@/component/DestopCategrory'
import NewArrivals from './NewArrivals'
import BestSellers from './BestSellers'
import ProductList from '../ProductList'
const LandingPage = () => {
  return (
    <div className="w-full">
      <Hero />
      <div className='pl-4 pr-4'>
         <DestopCategrory />
         <NewArrivals />
         <BestSellers />
         <ProductList category="phones" />
         <ProductList category="fridge" />
         <ProductList category="washingmachine" />
         <ProductList category="laptops" />
         <ProductList category="television" />
         <ProductList category="Accessories " />
        <OurPolicy />
      </div>
      
    </div>
  )
}

export default LandingPage
