import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

// have to create a separate component to use the useMap hook
// because useMap can only be used inside a MapContainer
export const Controller = ({
	latitude,
	longitude,
}: {
	latitude: number
	longitude: number
}) => {
	const map = useMap()
	useEffect(() => {
		// https://stackoverflow.com/questions/66272555/how-to-fly-to-a-location-in-react-leaflet
		// https://egghead.io/lessons/react-change-the-location-of-a-react-leaflet-map-with-leaflet-s-flyto-and-setview
		map.flyTo([latitude, longitude], map.getZoom(), {
			animate: true,
			duration: 1.5,
		})
	}, [latitude, longitude, map.flyTo, map.getZoom])
	return null
}
