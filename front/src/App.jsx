import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import AuthLayout from './components/layouts/Auth'
import SecureLayout from './components/layouts/Secure'
import VerifyEmail from './pages/VerifyEmail'
import { UserProvider } from './context/UserContext'
import Game from './components/game/Game'

const router = createBrowserRouter([
	{
		path: '/',
		element: <SecureLayout />,
		errorElement: 'Not found',
		children: [
			{
				path: '',
				element: ''
			},
			{
				path: 'dashboard',
				element: <Dashboard />
			},
			{
				path: 'game/:gameId',
				element: <Game />
			}
		]
	},
	{
		path: '/',
		element: <AuthLayout />,
		children: [
			{
				path: 'login',
				element: <Login />
			},
			{
				path: 'register',
				element: <Signup />
			},
			{
				path: 'verify/:id',
				element: <VerifyEmail />
			}
		]
	}
])

export function App() {
	return (
		<UserProvider>
			<RouterProvider router={router} />
		</UserProvider>
	)
}
