import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const VerifyEmail = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const [status, setStatus] = useState('pending')
	const [errorMessage, setErrorMessage] = useState('')

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/verify/${id}`, {
					method: 'GET'
				})

				const data = await response.json()

				if (response.ok) {
					setStatus('success')
				} else {
					setStatus('error')
					setErrorMessage(data.error || 'Échec de la vérification')
				}
			} catch (error) {
				console.error('Erreur lors de la vérification :', error)
				setStatus('error')
				setErrorMessage('Erreur lors de la communication avec le serveur')
			}
		}

		verifyEmail()
	}, [id])

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-base-200 p-8'>
			{/* Animation et message d'attente */}
			{status === 'pending' && (
				<div className='bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate__animated animate__fadeIn'>
					<h2 className='text-2xl font-semibold text-primary mb-4'>Vérification en cours...</h2>
					<p className='text-lg text-gray-600'>Nous vérifions votre adresse e-mail. Cela ne devrait pas prendre longtemps.</p>
					<div className='mt-4'>
						<div className='w-12 h-12 border-4 border-t-4 border-primary rounded-full animate-spin'></div>
					</div>
				</div>
			)}

			{/* Message de succès */}
			{status === 'success' && (
				<div className='bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate__animated animate__fadeIn'>
					<h2 className='text-2xl font-semibold text-green-500 mb-4'>Email vérifié avec succès !</h2>
					<p className='text-lg text-gray-600 mb-4'>Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.</p>
					<button onClick={() => navigate('/login')} className='btn btn-success mt-4 w-full py-2 text-white font-semibold rounded-lg shadow-md'>
						Aller à la page de connexion
					</button>
				</div>
			)}

			{/* Message d'erreur */}
			{status === 'error' && (
				<div className='bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center animate__animated animate__fadeIn'>
					<h2 className='text-2xl font-semibold text-red-500 mb-4'>Échec de la vérification</h2>
					<p className='text-lg text-gray-600 mb-4'>{errorMessage}</p>
					<Link to='/login' className='text-primary font-semibold hover:underline'>
						Retour à la connexion
					</Link>
				</div>
			)}
		</div>
	)
}

export default VerifyEmail
