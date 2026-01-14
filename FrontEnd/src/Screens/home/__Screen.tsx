import { Box, Container } from '@mantine/core'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Form } from './Form'
import { Markers } from './Markers'

export const Screen_Home = () => {
	return (
		<Container
			h="100vh"
			p={0}
			m={0}
			bg="#F5F5F5"
			fluid
			display="flex"
			style={{
				alignItems: 'center',
				flexDirection: 'column',
			}}
			pt="xl"
		>
			<Form />
			<Box id="map" style={{ height: '50%', width: '80%' }} mt="xl">
				{/* react-leaflet high cpu usage https://www.reddit.com/r/reactjs/comments/1oesd9s/high_cpu_usage_25_in_lowpower_react_app/ */}
				<MapContainer
					center={[1.342597, 103.864783]}
					zoom={20}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					<Markers />
				</MapContainer>
			</Box>
		</Container>
	)
}
