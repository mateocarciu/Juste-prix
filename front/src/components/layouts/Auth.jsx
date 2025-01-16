import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const AuthLayout = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
			<Link to={'/'} className='mb-8'>
				<img src='https://upload.wikimedia.org/wikipedia/fr/2/22/Logo_Juste_Prix_2024_%28M6%29.png' alt='logo' className='h-20 w-auto transition-transform duration-300 hover:scale-110' />
			</Link>

			<Outlet />
		</div>
	)
}

export default AuthLayout
