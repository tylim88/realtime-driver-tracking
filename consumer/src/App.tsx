import { Box, Container } from '@mantine/core'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

function App() {
	return (
		<Container
			h="100vh"
			p={0}
			m={0}
			bg="#F5F5F5"
			fluid
			display="flex"
			style={{
				justifyContent: 'center',
			}}
		>
			<Box id="map" style={{ height: '50%', width: '80%' }}>
				<MapContainer
					center={[51.505, -0.09]}
					zoom={13}
					scrollWheelZoom={false}
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker position={[51.505, -0.09]}>
						<Popup>
							A pretty CSS3 popup. <br /> Easily customizable.
						</Popup>
					</Marker>
				</MapContainer>
			</Box>
		</Container>
	)
}

export default App
