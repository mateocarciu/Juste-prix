import React, { createContext, useState, useEffect } from 'react'

// Créer le contexte utilisateur
export const UserContext = createContext()

// Créer un fournisseur pour le contexte
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null) // État pour stocker les informations de l'utilisateur
	const [loading, setLoading] = useState(true) // État pour gérer le chargement

	useEffect(() => {
		// Vérifier si un token et des informations d'utilisateur sont stockés dans le localStorage
		const storedUser = localStorage.getItem('user')
		if (storedUser) {
			setUser(JSON.parse(storedUser)) // Si oui, les restaurer dans l'état
		}
		setLoading(false) // Fin du chargement
	}, [])

	const login = (userData) => {
		// Fonction pour gérer la connexion, ici userData contient les infos de l'utilisateur
		setUser(userData)
		localStorage.setItem('user', JSON.stringify(userData)) // Enregistrer les infos utilisateur dans le localStorage
	}

	const logout = () => {
		// Fonction pour gérer la déconnexion
		setUser(null)
		localStorage.removeItem('user') // Supprimer les infos utilisateur du localStorage
	}

	return <UserContext.Provider value={{ user, loading, login, logout }}>{loading ? <div>Loading...</div> : children}</UserContext.Provider>
}
