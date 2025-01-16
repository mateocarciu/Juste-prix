import { getUserById, getUsers, loginUser, logoutUser, registerUser, verifyUser } from '../controllers/users.js'
export function usersRoutes(app) {
	app.post('/login', async (request, reply) => {
		reply.send(await loginUser(request.body, app, reply))
	})
	app
		.get('/verify/:id', async (request, reply) => {
			reply.send(await verifyUser(request.params, app, reply))
		})
		.post('/logout', async (request, reply) => {
			reply.send(await logoutUser(request.body, app, reply))
		})
	//inscription
	app.post('/register', async (request, reply) => {
		reply.send(await registerUser(request.body, app.bcrypt))
	})
	//récupération de la liste des utilisateurs
	app.get('/users', async (request, reply) => {
		reply.send(await getUsers())
	})
	//récupération d'un utilisateur par son id
	app.get('/users/:id', async (request, reply) => {
		reply.send(await getUserById(request.params.id))
	})
}
