import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { UserContext } from '../context/UserContext'

const Login = () => {
	const { login, user } = useContext(UserContext)
	const navigate = useNavigate()
	const [alertMessage, setAlertMessage] = useState('')
	const [alertType, setAlertType] = useState('error')

	useEffect(() => {
		if (user && user.token) {
			navigate('/dashboard')
		}
	}, [user, navigate])

	const validationSchema = Yup.object({
		email: Yup.string().email('Email invalide').required("L'email est requis"),
		password: Yup.string().required('Le mot de passe est requis')
	})

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(values)
			})

			const data = await response.json()

			if (response.ok) {
				login(data.user)
				navigate('/dashboard')
			} else {
				setAlertMessage(data.error || 'Une erreur est survenue')
				setAlertType('error')
			}
		} catch (error) {
			console.error('Erreur lors de la requête:', error)
			setAlertMessage('Erreur de connexion. Veuillez réessayer.')
			setAlertType('error')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='p-8 bg-base-200 text-base-content'>
			<div className='max-w-7xl mx-auto space-y-10'>
				{/* Login Form */}
				<div className='max-w-md mx-auto bg-base-100 p-8 rounded-xl shadow-xl mb-4'>
					{/* Alert Pop-up */}
					{alertMessage && (
						<div className={`alert ${alertType === 'error' ? 'alert-error' : 'alert-success'}`}>
							<div>
								<span>{alertMessage}</span>
							</div>
						</div>
					)}

					{isSubmitting && (
						<div className={`alert alert-info`}>
							<div>
								<span>Merci de bien vouloir patienter, le serveur est lent au démarrage...</span>
							</div>
						</div>
					)}
					<Formik initialValues={{ email: '', password: '' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
						{({ isSubmitting }) => (
							<Form>
								<h2 className='text-3xl font-bold mb-6 text-center'>Connexion</h2>

								{/* Email Field */}
								<div className='mb-4'>
									<Field type='email' name='email' placeholder='Votre email' className='input input-bordered w-full' />
									<ErrorMessage name='email' component='div' className='text-red-500 text-sm mt-1' />
								</div>

								{/* Password Field */}
								<div className='mb-6'>
									<Field type='password' name='password' placeholder='Votre mot de passe' className='input input-bordered w-full' />
									<ErrorMessage name='password' component='div' className='text-red-500 text-sm mt-1' />
								</div>

								{/* Submit Button */}
								<button type='submit' disabled={isSubmitting} className='btn btn-primary w-full text-lg py-2 mb-4'>
									{isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
								</button>
							</Form>
						)}
					</Formik>

					{/* Registration Link */}
					<div className='text-center'>
						<p>
							Pas encore de compte ?{' '}
							<Link to='/register' className='link text-primary'>
								Inscrivez-vous ici
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login
