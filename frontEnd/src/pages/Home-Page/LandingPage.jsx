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
         <ProductList category="phones" linkTo="/phones" />
         <ProductList category="fridge" linkTo="/phones" />
         <ProductList category="washingmachine" linkTo="/phones" />
         <ProductList category="laptops" linkTo="/laptops"/>
         <ProductList category="television" linkTo="/phones"/>
         <ProductList category="Accessories " linkTo="/phones" />
        <OurPolicy />
      </div>
      
    </div>
  )
}

export default LandingPage
