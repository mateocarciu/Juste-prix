import React, { useContext, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import io from 'socket.io-client'
import Confetti from 'react-confetti'

const Game = () => {
	const { user } = useContext(UserContext)
	const { gameId } = useParams()
	const [socket, setSocket] = useState(null)
	const [gameStarted, setGameStarted] = useState(false)
	const [isGameCreator, setIsGameCreator] = useState(false)
	const [gameFinished, setGameFinished] = useState(false)
	const [winner, setWinner] = useState('')
	const [errorMessage, setErrorMessage] = useState('')
	const [selectedObject, setSelectedObject] = useState(null)
	const [playerGuess, setPlayerGuess] = useState('')
	const [lastGuess, setLastGuess] = useState(null)
	const [proximityHint, setProximityHint] = useState('')
	const [currentTurn, setCurrentTurn] = useState(null)
	const [showPlayerJoinedAlert, setShowPlayerJoinedAlert] = useState(false)
	const [turnTimer, setTurnTimer] = useState(null)
	const [canPlay, setCanPlay] = useState(false)
	const [timeLeft, setTimeLeft] = useState(20)
	const [players, setPlayers] = useState([])

	useEffect(() => {
		const fetchGameState = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/game/${gameId}`, {
					headers: {
						Authorization: `Bearer ${user.token}`
					}
				})

				if (!response.ok) {
					throw new Error("Erreur lors de la récupération de l'état du jeu")
				}

				const gameState = await response.json()

				if (gameState.finished) {
					setGameFinished(true)
					setWinner(gameState.winner)
				} else {
					initSocket()
				}
			} catch (error) {
				setErrorMessage(error.message)
			}
		}

		if (user && user.token) {
			fetchGameState()
		}

		return () => {
			if (turnTimer) {
				clearTimeout(turnTimer)
			}
		}
	}, [gameId, user])

	useEffect(() => {
		let interval
		if (currentTurn && currentTurn !== user.id && gameStarted && !gameFinished) {
			setTimeLeft(20)
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(interval)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}

		return () => {
			if (interval) {
				clearInterval(interval)
			}
		}
	}, [currentTurn, user.id, gameStarted, gameFinished])

	const initSocket = () => {
		const newSocket = io(`${import.meta.env.VITE_API_URL}`, {
			query: { token: user.token }
		})
		setSocket(newSocket)

		newSocket.on('connect_error', () => {
			setErrorMessage('Erreur de connexion au serveur de jeu.')
		})

		newSocket.emit('joinGame', gameId, user.id)

		newSocket.on('playerJoined', (playerId) => {
			if (playerId !== user.id) {
				setShowPlayerJoinedAlert(true)
				setTimeout(() => setShowPlayerJoinedAlert(false), 5000)
			}
		})

		newSocket.on('isGameCreator', (creatorId) => {
			if (creatorId === user.id) {
				setIsGameCreator(true)
			}
		})

		newSocket.on('playersUpdate', (updatedPlayers) => {
			setPlayers(updatedPlayers)
		})

		newSocket.on('gameStarted', (data) => {
			setGameStarted(true)
			setSelectedObject(data.object)
		})

		newSocket.on('turnUpdate', (data) => {
			setCurrentTurn(data.currentTurn)
			setCanPlay(data.currentTurn === user.id)

			if (turnTimer) {
				clearTimeout(turnTimer)
			}

			if (data.currentTurn !== user.id) {
				const timer = setTimeout(() => {
					setCanPlay(true)
					socket.emit('timeoutTurn', gameId)
				}, 20000)
				setTurnTimer(timer)
			}
		})

		newSocket.on('gameUpdate', (data) => {
			setLastGuess(data.lastGuess)
			if (data.proximityHint) {
				setProximityHint(data.proximityHint)
			}
		})

		newSocket.on('gameFinished', (data) => {
			setGameFinished(true)
			setWinner(data.winner)
			if (turnTimer) {
				clearTimeout(turnTimer)
			}
		})

		return () => {
			if (turnTimer) {
				clearTimeout(turnTimer)
			}
			newSocket.close()
		}
	}

	const startGame = async () => {
		if (socket && isGameCreator) {
			socket.emit('startGame', gameId)
		}
	}

	const handleGuess = () => {
		if (socket && playerGuess && canPlay) {
			socket.emit('makeGuess', gameId, {
				guess: parseFloat(playerGuess),
				userId: user.id,
				token: user.token
			})
			setPlayerGuess('')
			setCanPlay(false)
		}
	}

	return (
		<div className='w-full h-screen bg-base-200 flex flex-col items-center justify-center p-6'>
			{/* Player joined Alert */}
			{showPlayerJoinedAlert && (
				<div className='alert alert-info'>
					<p>Un joueur a rejoint la partie, vous pouvez désormais la débuter !</p>
				</div>
			)}

			{/* Confetti on winner */}
			{winner && <Confetti />}

			{/* Error message */}
			{errorMessage && <div className='alert alert-error'>{errorMessage}</div>}

			{/* Game Finished */}
			{gameFinished ? (
				<div className='text-center'>
					<h2 className='text-3xl font-semibold mb-4'>Partie terminée !</h2>
					<p className='text-xl'>
						Le vainqueur est : <span className='font-bold'>{winner}</span>
					</p>
					<Link to='/dashboard' className='btn btn-primary mt-4'>
						Retourner au tableau de bord
					</Link>
				</div>
			) : !gameStarted ? (
				<div className='text-center'>
					<h2 className='text-3xl font-semibold mb-4'>La partie n'a pas encore commencé</h2>
					{players.length < 2 ? (
						<p>En attente d'un autre joueur...</p>
					) : (
						<>
							{isGameCreator && (
								<button className='btn btn-primary' onClick={startGame}>
									Démarrer la partie
								</button>
							)}
						</>
					)}
				</div>
			) : (
				<div className='text-center'>
					<h2 className='text-3xl font-semibold mb-4'>Devinez le prix !</h2>

					{/* Current Turn */}
					{currentTurn && (
						<div className='mb-4'>
							<p>{currentTurn === user.id ? "C'est votre tour !" : `En attente de l'autre joueur (${timeLeft}s)`}</p>
						</div>
					)}

					{/* Object Display */}
					{selectedObject && (
						<div className='bg-base-100 p-6 rounded-lg shadow-xl mb-6 max-w-sm mx-auto'>
							<img src={selectedObject.image} alt='Object' className='w-full h-auto max-h-64 object-contain mb-4' />
							<p className='text-xl text-center'>{selectedObject.name}</p>
							<button className='btn btn-info mt-4 mx-auto block' onClick={() => alert(`Le prix réel est : ${selectedObject.price} €`)}>
								Voir prix (🦧🦧)
							</button>
						</div>
					)}

					{/* Player Guess Input */}
					<div className='space-y-4'>
						<input type='number' className='input input-bordered w-full max-w-xs' value={playerGuess} onChange={(e) => setPlayerGuess(e.target.value)} disabled={!canPlay} placeholder='Devinez le prix' />
						<button className='btn btn-primary' onClick={handleGuess} disabled={!canPlay}>
							Soumettre votre devinette
						</button>
					</div>

					{/* Last Guess */}
					{lastGuess && (
						<div className='mt-4'>
							<p>Dernière devinette : {lastGuess} €</p>
							<p>{proximityHint}</p>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Game
