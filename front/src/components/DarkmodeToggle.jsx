import React, { useState, useEffect } from 'react'

const DarkModeToggle = () => {
	const [isDarkMode, setIsDarkMode] = useState(() => {
		const savedMode = localStorage.getItem('theme')
		return savedMode ? savedMode === 'dark' : true
	})

	useEffect(() => {
		const savedMode = localStorage.getItem('theme')
		if (savedMode) {
			setIsDarkMode(savedMode === 'dark')
			document.documentElement.setAttribute('data-theme', savedMode)
		} else {
			document.documentElement.setAttribute('data-theme', 'dark')
		}
	}, [])

	const toggleDarkMode = () => {
		const newTheme = isDarkMode ? 'light' : 'dark'
		setIsDarkMode(!isDarkMode)
		document.documentElement.setAttribute('data-theme', newTheme)
		localStorage.setItem('theme', newTheme)
	}

	return (
		<button onClick={toggleDarkMode} className='p-2  dark:bg-gray-800 rounded-full lg:transition-transform duration-300 hover:rotate-12 sm:transition-none active:scale-90' aria-label='Toggle Dark Mode'>
			{isDarkMode ? (
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-6 h-6 text-yellow-400'>
					<circle cx='12' cy='12' r='5' fill='currentColor' />
					<g stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
						<line x1='12' y1='1' x2='12' y2='4' />
						<line x1='12' y1='20' x2='12' y2='23' />
						<line x1='4.22' y1='4.22' x2='6.34' y2='6.34' />
						<line x1='17.66' y1='17.66' x2='19.78' y2='19.78' />
						<line x1='1' y1='12' x2='4' y2='12' />
						<line x1='20' y1='12' x2='23' y2='12' />
						<line x1='4.22' y1='19.78' x2='6.34' y2='17.66' />
						<line x1='17.66' y1='6.34' x2='19.78' y2='4.22' />
					</g>
				</svg>
			) : (
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='w-6 h-6 text-blue-500'>
					<path d='M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
				</svg>
			)}
		</button>
	)
}

export default DarkModeToggle
