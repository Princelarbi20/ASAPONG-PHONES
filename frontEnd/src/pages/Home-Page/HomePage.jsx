import React, { useState } from 'react'
import Navbar from '../../component/NavBar'
import Footer from '../../component/Footer'
import { Outlet } from 'react-router-dom'
import CategoriesMarquee from '@/component/CategoriesMarquee'
import Hero from '@/component/Hero'
export const HomePage = () => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')

  return (
    <div className='screen w-full'>
      <Navbar globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery} />
      <CategoriesMarquee />
      <main>
        <div className='w-full'>
         <Outlet />
        </div>
         
      </main>
       <Footer/>
    </div>
  )
}

export default HomePage