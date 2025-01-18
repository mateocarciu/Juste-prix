import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'

const AuthLayout = () => {
	return (
		<div className='min-h-screen bg-base-200'>
			<Navbar />

			{/* Main Content */}
			<main className='p-8'>
				<Outlet />
			</main>
		</div>
	)
}

export default AuthLayout
