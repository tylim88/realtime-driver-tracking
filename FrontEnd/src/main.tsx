import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import { Notifications } from '@mantine/notifications'
import { Screen_Home } from '@/Screens'

const root = document.getElementById('root')

if (root)
	createRoot(root).render(
		<StrictMode>
			<MantineProvider>
				<Notifications />
				<Screen_Home />
			</MantineProvider>
		</StrictMode>,
	)
