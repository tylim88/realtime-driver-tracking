import dayjs from 'dayjs'
import L from 'leaflet'
import { useEffect } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { useStoreMarks } from '@/store'
import { icon_steeringWheel, icon_x } from '@/svg'

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

export const Markers = () => {
	const map = useMap()
	const marks = useStoreMarks((state) => state.marks)
	const latest = marks[0]
	const longitude_latest = latest?.longitude
	const latitude_latest = latest?.latitude

	useEffect(() => {
		if (!latest) return
		// https://stackoverflow.com/questions/66272555/how-to-fly-to-a-location-in-react-leaflet
		// https://egghead.io/lessons/react-change-the-location-of-a-react-leaflet-map-with-leaflet-s-flyto-and-setview
		map.flyTo([latitude_latest || 0, longitude_latest || 0], map.getZoom(), {
			animate: true,
			duration: 1.5,
		})
	}, [latest, latitude_latest, longitude_latest, map.flyTo, map.getZoom])
	return (
		<>
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
							recorded at: {dayjs(recorded_at).format('DD MMM YYYY hh:mm A')}
						</Popup>
					</Marker>
				)
			})}
		</>
	)
}
