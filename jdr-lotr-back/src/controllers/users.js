import User from '../models/users.js'
import { Op } from 'sequelize'
import { sendVerificationEmail } from '../mailer/mailer.js'

async function generateID(id) {
	const { count } = await findAndCountAllUsersById(id)
	if (count > 0) {
		id = id.substring(0, 5)
		const { count } = await findAndCountAllUsersById(id)
		id = id + (count + 1)
	}
	return id
}

export async function getUsers() {
	return await User.findAll()
}

export async function getUserById(id) {
	return await User.findByPk(id)
}

export async function findAndCountAllUsersById(id) {
	return await User.findAndCountAll({
		where: {
			id: {
				[Op.like]: `${id}%`
			}
		}
	})
}

export async function findAndCountAllUsersByEmail(email) {
	return await User.findAndCountAll({
		where: {
			email: {
				[Op.eq]: email
			}
		}
	})
}

export async function findAndCountAllUsersByUsername(username) {
	return await User.findAndCountAll({
		where: {
			username: {
				[Op.eq]: username
			}
		}
	})
}

export async function registerUser(userDatas, bcrypt) {
	if (!userDatas) {
		return { error: 'Aucune donnée à enregistrer' }
	}
	const { firstname, lastname, username, email, password } = userDatas
	if (!firstname || !lastname || !username || !email || !password) {
		return { error: 'Tous les champs sont obligatoires' }
	}

	// Vérification que l'email n'est pas déjà utilisé
	const { count: emailCount } = await findAndCountAllUsersByEmail(email)
	if (emailCount > 0) {
		return { error: "L'adresse email est déjà utilisée." }
	}

	// Vérification que le pseudo n'est pas déjà utilisé
	const { count: usernameCount } = await findAndCountAllUsersByUsername(username)
	if (usernameCount > 0) {
		return { error: "Le nom d'utilisateur est déjà utilisé." }
	}

	// Création de l'identifiant
	let id = await generateID((lastname.substring(0, 3) + firstname.substring(0, 3)).toUpperCase())

	// Hashage du mot de passe
	const hashedPassword = await bcrypt.hash(password)

	// Création de l'utilisateur dans la base de données
	const user = {
		id,
		firstname,
		lastname,
		username,
		email,
		password: hashedPassword
	}
	const createdUser = await User.create(user)

	// Créer un lien de vérification
	const verificationLink = `${process.env.FRONT_URL}/verify/${createdUser.id}`

	// Envoyer l'email de vérification
	await sendVerificationEmail(email, verificationLink)

	return createdUser
}

export async function loginUser(userDatas, app, reply) {
	try {
		if (!userDatas) {
			return reply.code(400).send({ error: "Aucune donnée n'a été envoyée" })
		}

		const { email, password } = userDatas
		if (!email || !password) {
			return reply.code(400).send({ error: 'Tous les champs sont obligatoires' })
		}

		// Vérification que l'email est utilisé
		const { count, rows } = await findAndCountAllUsersByEmail(email)
		if (count === 0) {
			return reply.code(404).send({
				error: "Il n'y a pas d'utilisateur associé à cette adresse email."
			})
		}

		// Vérification si l'utilisateur est vérifié
		const user = rows[0]
		if (!user.verified) {
			return reply.code(401).send({
				error: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre boîte mail."
			})
		}

		// Récupération de l'utilisateur
		const userRecord = await User.findOne({
			where: { email: { [Op.eq]: email } }
		})

		// Comparaison des mots de passe
		const match = await app.bcrypt.compare(password, userRecord.password)
		if (!match) {
			return reply.code(401).send({ error: 'Mot de passe incorrect' })
		}

		// Générer le JWT après une authentification réussie
		const token = app.jwt.sign({ id: userRecord.id, username: userRecord.username })

		// Enregistrer le token dans la base de données
		await User.update({ token }, { where: { id: userRecord.id } })

		// Recharger l'utilisateur pour s'assurer que les informations sont à jour
		const updatedUser = await User.findOne({
			where: { id: userRecord.id },
			attributes: { exclude: ['password'] } // Exclure le champ 'password' des résultats
		})

		// Retourner la réponse avec les informations de l'utilisateur et le token
		return reply.code(200).send({ user: updatedUser })
	} catch (error) {
		console.error(error)
		return reply.code(500).send({ error: 'Erreur interne du serveur' })
	}
}

export async function logoutUser(body, app, reply) {
	try {
		const token = body.token // Récupérer le token depuis le corps de la requête

		if (!token) {
			return reply.code(400).send({ error: 'Token manquant.' })
		}

		// Supprimer le token de l'utilisateur dans la base de données
		const [updatedRows] = await User.update({ token: null }, { where: { token } })

		// Vérifier si un utilisateur a été mis à jour
		if (updatedRows === 0) {
			return reply.code(404).send({ error: 'Aucun utilisateur trouvé avec ce token.' })
		}

		// Retourner une réponse de succès
		return reply.send({ logout: true })
	} catch (error) {
		console.error('Erreur lors de la déconnexion :', error)
		return reply.code(500).send({ error: 'Erreur interne du serveur' })
	}
}

export async function verifyUser(params, app, reply) {
	try {
		const userId = params.id // Récupérer l'ID de l'utilisateur depuis les paramètres

		// Rechercher l'utilisateur dans la base de données
		const user = await User.findByPk(userId)

		if (!user) {
			return reply.code(404).send({ error: 'Utilisateur non trouvé' })
		}

		// Vérifier si l'utilisateur est déjà vérifié
		if (user.verified) {
			return reply.code(400).send({ error: "L'utilisateur est déjà vérifié" })
		}

		// Mettre à jour l'utilisateur comme vérifié
		await User.update({ verified: true }, { where: { id: userId } })

		return reply.code(200).send({ message: 'Email vérifié avec succès' })
	} catch (error) {
		console.error('Erreur lors de la vérification :', error)
		return reply.code(500).send({ error: 'Erreur interne du serveur' })
	}
}
