import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const AuthLayout = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-8'>
			<Link to={'/'}>
				<img src='https://upload.wikimedia.org/wikipedia/fr/2/22/Logo_Juste_Prix_2024_%28M6%29.png' alt='logo' className='h-20 w-30 mb-6' />
			</Link>
			<Outlet />
		</div>
	)
}

export default AuthLayout
