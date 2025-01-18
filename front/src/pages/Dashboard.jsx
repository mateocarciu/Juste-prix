import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import io from 'socket.io-client'

const Dashboard = () => {
	const { user } = useContext(UserContext)
	const navigate = useNavigate()
	const [socket, setSocket] = useState(null)
	const [gameId, setGameId] = useState('')
	const [openGames, setOpenGames] = useState([])
	const [finishedGames, setFinishedGames] = useState([])

	useEffect(() => {
		if (!user || !user.token) {
			navigate('/login')
		} else {
			const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
				query: { token: user.token }
			})
			setSocket(newSocket)

			newSocket.on('newGameCreated', () => {
				fetchOpenGames()
			})

			return () => {
				newSocket.close()
			}
		}
	}, [user, navigate])

	const fetchOpenGames = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/games/open`, {
				headers: {
					Authorization: `Bearer ${user.token}`
				}
			})
			if (!response.ok) {
				throw new Error('Erreur lors de la récupération des parties ouvertes')
			}
			const data = await response.json()
			setOpenGames(data)
		} catch (error) {
			console.error('Erreur :', error)
		}
	}

	const fetchFinishedGames = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/games/finished`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`
				},
				body: JSON.stringify({ userId: user.id })
			})
			if (!response.ok) {
				throw new Error('Erreur lors de la récupération des parties terminées')
			}
			const data = await response.json()
			setFinishedGames(data)
		} catch (error) {
			console.error('Erreur :', error)
		}
	}

	useEffect(() => {
		if (user) {
			fetchOpenGames()
			fetchFinishedGames()
		}
	}, [user])

	const createGame = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/game`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`
				},
				body: JSON.stringify({ userId: user.id })
			})
			if (!response.ok) {
				throw new Error('Erreur lors de la création de la partie')
			}
			const data = await response.json()
			setGameId(data.gameId)
			if (socket) {
				socket.emit('joinGame', data.gameId, user.id)
				socket.emit('fetchNewGames', user.id)
				navigate(`/game/${data.gameId}`)
			}
		} catch (error) {
			console.error('Erreur :', error)
		}
	}

	const joinGame = async (gameId) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/game/join/${gameId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${user.token}`
				},
				body: JSON.stringify({ userId: user.id })
			})
			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || 'Erreur lors de la tentative de rejoindre la partie')
			}
			if (socket) {
				socket.emit('joinGame', gameId, user.id)
				socket.emit('fetchNewGames')
				navigate(`/game/${gameId}`)
			}
		} catch (error) {
			console.error('Erreur :', error)
			alert(error.message)
		}
	}

	return (
		<div className='p-8 bg-base-200 text-base-content min-h-screen'>
			<div className='max-w-7xl mx-auto space-y-10'>
				<header className='text-center'>
					<h1 className='text-4xl font-extrabold mb-2'>Bonjour, {user?.id}</h1>
					<p className='text-gray-600 dark:text-gray-400'>Gérez vos parties ouvertes et découvrez les parties terminées.</p>
				</header>

				{/* Actions */}
				<div className='flex justify-center'>
					{!gameId && (
						<button onClick={createGame} className='btn btn-primary btn-lg shadow-lg hover:scale-105 transition-transform'>
							Créer une nouvelle partie
						</button>
					)}
				</div>

				{/* Open Games */}
				<section>
					<h2 className='text-2xl font-semibold mb-4'>Parties ouvertes</h2>
					{openGames.length > 0 ? (
						<div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
							{openGames.map((game) => (
								<div key={game.id} className='card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow'>
									<div className='card-body'>
										<h3 className='card-title'>Partie {game.id}</h3>
										<p>
											Créée par : <strong>{game.creator}</strong>
										</p>
										<div className='card-actions justify-end'>
											<button onClick={() => joinGame(game.id)} className='btn btn-accent'>
												Rejoindre
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className='text-gray-500'>Aucune partie ouverte pour le moment.</p>
					)}
				</section>

				{/* Finished Games */}
				<section>
					<h2 className='text-2xl font-semibold mb-4'>Parties terminées</h2>
					{finishedGames.length > 0 ? (
						<div className='overflow-x-auto'>
							<table className='table table-zebra w-full'>
								<thead>
									<tr>
										<th>ID</th>
										<th>Créateur</th>
										<th>Gagnant</th>
										<th>Score</th>
										<th>Créée</th>
										<th>Terminée</th>
									</tr>
								</thead>
								<tbody>
									{finishedGames.map((game) => (
										<tr key={game.id}>
											<td>{game.id}</td>
											<td>{game.creator}</td>
											<td>{game.winner}</td>
											<td>{game.winnerScore}</td>
											<td>{new Date(game.createdAt).toLocaleString()}</td>
											<td>{new Date(game.updatedAt).toLocaleString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className='text-gray-500'>Aucune partie terminée pour le moment.</p>
					)}
				</section>
			</div>
		</div>
	)
}

export default Dashboard
