import React, { useContext } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Navbar from '../../components/Navbar'

const SecureLayout = () => {
	const { user } = useContext(UserContext)
	const location = useLocation()

	return (
		<>
			{/* Navbar */}
			<Navbar />

			{/* Page d'accueil avec un design plus attractif */}
			{location.pathname === '/' ? (
				<div className='p-8 bg-base-200 min-h-screen flex flex-col justify-center items-center'>
					{/* Section explicative avec animation */}
					<div className='max-w-4xl mx-auto text-center space-y-8 animate__animated animate__fadeIn'>
						{/* Titre principal */}
						<div className='bg-base-100 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300'>
							<h2 className='text-4xl font-semibold mb-4 text-primary'>Le Juste Prix</h2>
							<p className='text-xl text-gray-600'>Le principe est simple : devinez le prix exact de l'objet affiché. Celui qui trouve le prix exact remporte la partie !</p>
							<p className='text-lg text-gray-600'>Les objets sont issus d'une API dédiée, qui sélectionne des articles et leurs prix aléatoirement. À chaque tour, vous devrez trouver le prix de l'objet affiché.</p>
							<p className='text-lg text-gray-600'>Proposez votre prix et utilisez les retours pour ajuster votre stratégie. Bonne chance !</p>
						</div>
					</div>

					{/* Section d'informations supplémentaires */}
					<div className='mt-16 text-center'>
						<h3 className='text-2xl font-semibold text-gray-700'>Comment ça marche ?</h3>
						<p className='text-lg text-gray-600 mt-4'>Le jeu se joue en 3 étapes : découvrir un objet, proposer un prix et obtenir un retour.</p>
						<div className='flex justify-center space-x-8 mt-8'>
							<div className='flex flex-col items-center'>
								<div className='w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center'>
									<span className='text-2xl'>1</span>
								</div>
								<p className='mt-2'>Découvrez l'objet</p>
							</div>
							<div className='flex flex-col items-center'>
								<div className='w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center'>
									<span className='text-2xl'>2</span>
								</div>
								<p className='mt-2'>Proposez votre prix</p>
							</div>
							<div className='flex flex-col items-center'>
								<div className='w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center'>
									<span className='text-2xl'>3</span>
								</div>
								<p className='mt-2'>Ajustez votre stratégie</p>
							</div>
						</div>
					</div>
				</div>
			) : (
				<Outlet />
			)}
		</>
	)
}

export default SecureLayout
