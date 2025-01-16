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
		<div className='flex flex-col justify-center items-center'>
			<div className='w-full max-w-md p-8 rounded shadow-lg text-center'>
				{status === 'pending' && <h2 className='text-2xl mb-4'>Vérification en cours...</h2>}
				{status === 'success' && (
					<>
						<h2 className='text-2xl mb-4'>Email vérifié avec succès !</h2>
						<p className='mb-4'>Votre compte a été activé. Vous pouvez maintenant vous connecter.</p>
						<button onClick={() => navigate('/login')} className='btn btn-primary w-full'>
							Aller à la page de connexion
						</button>
					</>
				)}
				{status === 'error' && (
					<>
						<h2 className='text-2xl mb-4'>Échec de la vérification</h2>
						<p className='mb-4'>{errorMessage}</p>
						<Link to='/login' className='btn btn-secondary w-full'>
							Connexion
						</Link>
					</>
				)}
			</div>
		</div>
	)
}

export default VerifyEmail
