import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const Signup = () => {
	const navigate = useNavigate()
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [showPopup, setShowPopup] = useState(false)

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
				alert(data.error || "Une erreur est survenue lors de l'inscription")
			}
		} catch (error) {
			console.error('Erreur lors de la requête:', error)
			alert("Erreur lors de l'inscription. Veuillez réessayer.")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className='flex flex-col justify-center items-center bg-white dark:bg-gray-800'>
			<div className='w-full max-w-md p-8 rounded shadow-lg'>
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
					{({ isSubmitting }) => (
						<Form>
							<h2 className='text-3xl font-bold mb-6 text-center'>Inscription</h2>
							<div className='mb-4'>
								<Field type='text' name='firstName' placeholder='Prénom' className='input input-bordered w-full' />
								<ErrorMessage name='firstName' component='div' className='text-red-600' />
							</div>
							<div className='mb-4'>
								<Field type='text' name='lastName' placeholder='Nom' className='input input-bordered w-full' />
								<ErrorMessage name='lastName' component='div' className='text-red-600' />
							</div>
							<div className='mb-4'>
								<Field type='email' name='email' placeholder='Email' className='input input-bordered w-full' />
								<ErrorMessage name='email' component='div' className='text-red-600' />
							</div>
							<div className='mb-4'>
								<Field type='text' name='username' placeholder="Nom d'utilisateur" className='input input-bordered w-full' />
								<ErrorMessage name='username' component='div' className='text-red-600' />
							</div>
							<div className='relative mb-4'>
								<Field type={showPassword ? 'text' : 'password'} name='password' placeholder='Mot de passe' className='input input-bordered w-full pr-10' />
								<button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 flex items-center pr-3'>
									{showPassword ? '👁' : '🙈'}
								</button>
								<ErrorMessage name='password' component='div' className='text-red-600' />
							</div>
							<div className='relative mb-4'>
								<Field type={showConfirmPassword ? 'text' : 'password'} name='confirmPassword' placeholder='Confirmer le mot de passe' className='input input-bordered w-full pr-10' />
								<button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute inset-y-0 right-0 flex items-center pr-3'>
									{showConfirmPassword ? '👁' : '🙈'}
								</button>
								<ErrorMessage name='confirmPassword' component='div' className='text-red-600' />
							</div>
							<button type='submit' className='btn btn-primary w-full' disabled={isSubmitting}>
								{isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
							</button>
						</Form>
					)}
				</Formik>
				<div className='mt-4 text-center'>
					<Link to='/login' className='text-blue-500 hover:underline'>
						Connexion
					</Link>
				</div>
			</div>

			{showPopup && (
				<div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50'>
					<div className='bg-white p-6 rounded shadow-lg'>
						<h3 className='text-xl font-bold mb-4'>Inscription réussie !</h3>
						<p>Un email de vérification a été envoyé à votre adresse e-mail.</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default Signup
