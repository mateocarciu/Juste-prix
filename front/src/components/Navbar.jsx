import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import DarkModeToggle from './DarkmodeToggle'

const Navbar = () => {
	const { user, logout } = useContext(UserContext)
	const navigate = useNavigate()
	const [isMenuOpen, setIsMenuOpen] = useState(false)

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

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen)
	}

	const handleClickOutside = (event) => {
		if (!event.target.closest('.dropdown')) {
			setIsMenuOpen(false)
		}
	}

	useEffect(() => {
		document.addEventListener('click', handleClickOutside)
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [])

	return (
		<nav className='navbar bg-base-100 shadow-md px-4 sm:px-8'>
			{/* Logo */}
			<div className='navbar-start'>
				<Link to='/' className='flex items-center gap-2'>
					<span className='font-bold text-lg'>Le Juste Prix</span>
				</Link>
			</div>

			{/* Menu pour mobile */}
			<div className='navbar-end lg:hidden'>
				<div className='dropdown'>
					<label tabIndex={0} className='btn btn-ghost btn-circle' onClick={handleMenuToggle}>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7' />
						</svg>
					</label>
					{isMenuOpen && (
						<ul tabIndex={0} className='menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 right-0 z-10'>
							<li>
								<Link to='/'>Accueil</Link>
							</li>
							{user && user.token && (
								<li>
									<Link to='/dashboard'>Dashboard</Link>
								</li>
							)}
							{user && user.token ? (
								<li>
									<button onClick={handleLogout} className='btn btn-primary btn-sm'>
										Déconnexion
									</button>
								</li>
							) : (
								<>
									<li>
										<Link to='/login' className='btn btn-outline btn-sm'>
											Connexion
										</Link>
									</li>
									<li>
										<Link to='/register' className='btn btn-primary btn-sm'>
											Inscription
										</Link>
									</li>
								</>
							)}
							<li>
								<DarkModeToggle />
							</li>
						</ul>
					)}
				</div>
			</div>

			{/* Menu pour desktop */}
			<div className='navbar-center hidden lg:flex'>
				<ul className='menu menu-horizontal px-1'>
					<li>
						<Link to='/'>Accueil</Link>
					</li>
					{user && user.token && (
						<li>
							<Link to='/dashboard'>Dashboard</Link>
						</li>
					)}
				</ul>
			</div>

			{/* Déconnexion et DarkMode pour desktop */}
			<div className='navbar-end hidden lg:flex items-center gap-4'>
				<DarkModeToggle />
				{user && user.token ? (
					<button onClick={handleLogout} className='btn btn-primary btn-sm'>
						Déconnexion
					</button>
				) : (
					<>
						<Link to='/login' className='btn btn-outline btn-sm'>
							Connexion
						</Link>
						<Link to='/register' className='btn btn-primary btn-sm'>
							Inscription
						</Link>
					</>
				)}
			</div>
		</nav>
	)
}

export default Navbar
