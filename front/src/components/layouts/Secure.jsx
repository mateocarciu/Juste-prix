import React, { useContext } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Navbar from '../../components/Navbar'

const SecureLayout = () => {
	const { user } = useContext(UserContext)
	const location = useLocation()

	return (
		<>
			<Navbar />
			{location.pathname === '/' ? (
				<div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition duration-300'>
					{/* Carte explicative */}
					<div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-3xl text-center text-gray-900 dark:text-gray-200'>
						<h2 className='text-4xl font-extrabold mb-6 text-teal-600 dark:text-teal-400'>Le Juste Prix</h2>
						<p className='text-lg mb-4 leading-relaxed'>Le principe est simple : devinez le prix exact de l'objet affiché. Celui qui trouve le prix exact remporte la partie !</p>
						<p className='text-lg mb-4 leading-relaxed'>Les objets sont issus d'une API dédiée, qui sélectionne des articles et leurs prix aléatoirement. À chaque tour, vous devrez trouver le prix de l'objet affiché.</p>
						<p className='text-lg leading-relaxed'>Proposez votre prix et utilisez les retours pour ajuster votre stratégie. Bonne chance !</p>
					</div>

					{!user && (
						<div className='mt-10 flex justify-center'>
							<Link to='/register' className='bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 hover:from-teal-600 hover:to-cyan-700 text-white py-3 px-8 rounded-full shadow-md text-lg font-semibold transition duration-300'>
								S'inscrire
							</Link>
						</div>
					)}
				</div>
			) : (
				<Outlet />
			)}
		</>
	)
}

export default SecureLayout
