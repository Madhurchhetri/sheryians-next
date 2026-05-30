import Link from 'next/link'
import React from 'react'
import { ModeToggle } from './toggleTheme'

const Navbar = () => {
  return (
    <div className='flex items-center justify-between p-4 '>
        <h1 className='text-3xl font-bold'>Ecommerce</h1>
        <div className ='flex items-center text-3xl gap-5 font-semibold'>
            <Link href="/layout/home">Home</Link>
            <Link href="/layout/products">Products</Link>
        </div>
        <div>
            <ModeToggle/>
        </div>
    </div>
  )
}

export default Navbar