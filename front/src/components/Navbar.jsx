import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import DarkModeToggle from './DarkmodeToggle'

const Navbar = () => {
	const { user, logout } = useContext(UserContext)
	const navigate = useNavigate()

	const handleLogout = async () => {
		if (user && user.token) {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ token: user.token })
				})

				if (response.ok) {
					logout()
					navigate('/login')
				} else {
					console.error('Erreur lors de la déconnexion')
				}
			} catch (error) {
				console.error('Erreur réseau', error)
			}
		}
	}

	return (
		<nav className='fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md transition duration-300 z-10'>
			<div className='container mx-auto px-4 py-3 flex justify-between items-center'>
				{/* Logo */}
				<Link to='/' className='flex items-center'>
					<img src='https://upload.wikimedia.org/wikipedia/fr/2/22/Logo_Juste_Prix_2024_%28M6%29.png' alt='logo' className='h-12 w-auto' />
				</Link>

				{/* Menu */}
				<div className='flex items-center space-x-4'>
					{/* Mode sombre */}
					<DarkModeToggle />

					{user && user.token ? (
						<>
							<Link to='/dashboard' className='text-gray-800 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400 transition'>
								Dashboard
							</Link>
							<button onClick={handleLogout} className='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition'>
								Déconnexion
							</button>
						</>
					) : (
						<>
							<Link to='/login' className='text-gray-800 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400 transition'>
								Connexion
							</Link>
							<Link to='/register' className='bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg shadow-md transition'>
								Inscription
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navbar
