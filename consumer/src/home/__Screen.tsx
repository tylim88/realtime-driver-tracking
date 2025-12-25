import { Box, Container } from '@mantine/core'
import dayjs from 'dayjs'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { icon_steeringWheel, icon_x } from '@/svg'
import { Controller } from './Controller'
import { Form } from './Form'

const IconSteeringWheel = new L.Icon({
	iconUrl: icon_steeringWheel,
	iconRetinaUrl: icon_steeringWheel,
	iconSize: new L.Point(24, 24),
})

const IconX = new L.Icon({
	iconUrl: icon_x,
	iconRetinaUrl: icon_x,
	iconSize: new L.Point(16, 16),
})

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
			<Form>
				{(marks) => {
					const latest = marks[0]

					return (
						<Box id="map" style={{ height: '50%', width: '80%' }} mt="xl">
							<MapContainer
								center={
									marks[0]
										? [marks[0].latitude, marks[0].longitude]
										: [1.342597, 103.864783]
								}
								zoom={20}
								style={{ height: '100%', width: '100%' }}
							>
								{latest && (
									<Controller
										latitude={latest.latitude}
										longitude={latest.longitude}
									/>
								)}
								<TileLayer
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								/>

								{marks.map(({ latitude, longitude, recorded_at }, index) => {
									const icon = index ? IconX : IconSteeringWheel
									return (
										<Marker
											key={recorded_at + latitude + longitude}
											position={[latitude, longitude]}
											icon={icon}
										>
											<Popup>
												latitude: {latitude}
												<br />
												longitude: {longitude}
												<br />
												recorded at:{' '}
												{dayjs(recorded_at).format('DD MMM YYYY hh:mm A')}
											</Popup>
										</Marker>
									)
								})}
							</MapContainer>
						</Box>
					)
				}}
			</Form>
		</Container>
	)
}
