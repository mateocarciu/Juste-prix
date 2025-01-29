import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const Signup = () => {
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [showPopup, setShowPopup] = useState(false)
	const [errorPopup, setErrorPopup] = useState(false)
	const [isSubmittingPop, setIsSubmittingPop] = useState(false)

	const validationSchema = Yup.object({
		firstName: Yup.string().required('Le prénom est requis'),
		lastName: Yup.string().required('Le nom est requis'),
		email: Yup.string().email('Email invalide').required("L'email est requis"),
		username: Yup.string().required("Le nom d'utilisateur est requis"),
		password: Yup.string().required('Le mot de passe est requis'),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
			.required('La confirmation du mot de passe est requise')
	})

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					firstname: values.firstName,
					lastname: values.lastName,
					email: values.email,
					username: values.username,
					password: values.password
				})
			})

			const data = await response.json()

			if (response.ok) {
				setShowPopup(true)
				setTimeout(() => {
					setShowPopup(false)
					navigate('/login')
				}, 3000)
			} else {
				setErrorPopup(true)
				setTimeout(() => setErrorPopup(false), 3000)
			}
		} catch (error) {
			console.error('Erreur lors de la requête:', error)
			setErrorPopup(true)
			setTimeout(() => setErrorPopup(false), 3000)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='p-8 bg-base-200 text-base-content min-h-screen'>
			<div className='max-w-7xl mx-auto space-y-10'>
				{/* Signup Form */}
				<div className='max-w-md mx-auto bg-base-100 p-8 rounded-xl shadow-xl'>
					{/* Success Popup */}
					{showPopup && (
						<div className='alert alert-success'>
							<div>
								<span>Inscription réussie ! Un email de vérification a été envoyé à votre adresse e-mail.</span>
							</div>
						</div>
					)}

					{/* Error Popup */}
					{errorPopup && (
						<div className='alert alert-error'>
							<div>
								<span>Erreur lors de l'inscription. Veuillez réessayer.</span>
							</div>
						</div>
					)}

					{isSubmittingPop && (
						<div className={`alert alert-info`}>
							<div>
								<span>Merci de bien vouloir patienter, le serveur est lent au démarrage...</span>
							</div>
						</div>
					)}
					<Formik
						initialValues={{
							firstName: '',
							lastName: '',
							email: '',
							username: '',
							password: '',
							confirmPassword: ''
						}}
						validationSchema={validationSchema}
						onSubmit={handleSubmit}
					>
						{({ isSubmitting }) => {
							setIsSubmittingPop(isSubmitting)
							return (
								<Form>
									<h2 className='text-3xl font-bold mb-6 text-center'>Inscription</h2>

									{/* First Name */}
									<div className='mb-4'>
										<Field type='text' name='firstName' placeholder='Prénom' className='input input-bordered w-full' />
										<ErrorMessage name='firstName' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Last Name */}
									<div className='mb-4'>
										<Field type='text' name='lastName' placeholder='Nom' className='input input-bordered w-full' />
										<ErrorMessage name='lastName' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Email */}
									<div className='mb-4'>
										<Field type='email' name='email' placeholder='Email' className='input input-bordered w-full' />
										<ErrorMessage name='email' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Username */}
									<div className='mb-4'>
										<Field type='text' name='username' placeholder="Nom d'utilisateur" className='input input-bordered w-full' />
										<ErrorMessage name='username' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Password */}
									<div className='mb-4 relative'>
										<Field type={showPassword ? 'text' : 'password'} name='password' placeholder='Mot de passe' className='input input-bordered w-full' />
										<button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xl'>
											{showPassword ? '👁' : '🙈'}
										</button>
										<ErrorMessage name='password' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Confirm Password */}
									<div className='mb-6 relative'>
										<Field type={showConfirmPassword ? 'text' : 'password'} name='confirmPassword' placeholder='Confirmer le mot de passe' className='input input-bordered w-full' />
										<button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xl'>
											{showConfirmPassword ? '👁' : '🙈'}
										</button>
										<ErrorMessage name='confirmPassword' component='div' className='text-red-500 text-sm mt-1' />
									</div>

									{/* Submit Button */}
									<button type='submit' disabled={isSubmitting} className='btn btn-primary w-full text-lg py-2 mb-4'>
										{isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
									</button>
								</Form>
							)
						}}
					</Formik>

					{/* Login Link */}
					<div className='text-center'>
						<p>
							Vous avez déjà un compte ?{' '}
							<Link to='/login' className='link text-primary'>
								Connectez-vous ici
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Signup
