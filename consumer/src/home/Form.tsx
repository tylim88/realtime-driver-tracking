import { treaty } from '@elysiajs/eden'
import { Button, NumberInput, Select, SimpleGrid, Text } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import {
	IconCircleCheckFilled,
	IconInfoCircleFilled,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { driverLocation_ws, Query } from '#/driverLocation.ws'

type App = ReturnType<typeof driverLocation_ws>

// @ts-expect-error https://github.com/oven-sh/bun/issues/23725
const client = treaty<App>('localhost:3001')

type Marks = { latitude: number; longitude: number; recorded_at: string }[]

export const Form = ({ children }: { children: (marks: Marks) => void }) => {
	const [marks, setMarks] = useState<Marks>([])
	const latestTimestamp = useRef(0)

	const {
		control,
		handleSubmit,
		formState: { isSubmitSuccessful },
		getValues,
	} = useForm<{
		driver_id: number
		interval_type: Query['interval_type']
		interval_value: number
		since: string
	}>({
		defaultValues: {
			driver_id: 1,
			interval_type: 'second',
			interval_value: 5,
			since: new Date().toISOString(),
		},
	})

	useEffect(() => {
		if (!isSubmitSuccessful) return
		const ws = client.driverLocation.subscribe({
			query: {
				driver_id: getValues('driver_id').toString(),
				interval_type: getValues('interval_type'),
				interval_value: getValues('interval_value').toString(),
				since: getValues('since'),
			},
		})
		ws.subscribe(({ data }) => {
			if (data.type === 'data_old') {
				setMarks((marks) => {
					const arr = [
						...marks,
						...data.data.map(
							({ latitude_average, longitude_average, time }) => ({
								latitude: latitude_average,
								longitude: longitude_average,
								recorded_at: time,
							}),
						),
					].sort((a, b) => +new Date(b.recorded_at) - +new Date(a.recorded_at))
					latestTimestamp.current = +new Date(arr[0]?.recorded_at || '')
					return arr
				})
			} else {
				setMarks((marks) => {
					// if the data is older than the latest timestamp, sort it again
					if (+new Date(data.recorded_at) <= latestTimestamp.current) {
						return [
							...marks,
							{
								latitude: data.latitude,
								longitude: data.longitude,
								recorded_at: data.recorded_at,
							},
						].sort(
							(a, b) => +new Date(b.recorded_at) - +new Date(a.recorded_at),
						)
					}
					const arr = [
						{
							latitude: data.latitude,
							longitude: data.longitude,
							recorded_at: data.recorded_at,
						},
						...marks,
					]
					latestTimestamp.current = +new Date(arr[0]?.recorded_at || '')
					return arr
				})
			}
		})
		ws.on('open', () => {
			setTimeout(() => {
				notifications.show({
					title: 'WebSocket Opened',
					message: `Driver ${getValues('driver_id')} connection has been opened.`,
					icon: <IconCircleCheckFilled color="green" />,
					color: 'green',
					autoClose: 500,
				})
			}, 250)
		})
		return () => {
			notifications.show({
				title: 'WebSocket Closed',
				message: `Driver ${getValues('driver_id')} connection has been closed.`,
				icon: <IconInfoCircleFilled color="blue" />,
				autoClose: 500,
			})
			ws.close()
		}
	}, [isSubmitSuccessful, getValues])

	return (
		<>
			<SimpleGrid
				cols={2}
				spacing="md"
				mb="md"
				component="form"
				onSubmit={handleSubmit(() => {})}
			>
				<Controller
					name="driver_id"
					control={control}
					render={({ field, fieldState }) => (
						<NumberInput
							allowDecimal={false}
							label="Driver ID"
							{...field}
							min={1}
							max={10}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="since"
					control={control}
					render={({ field, fieldState }) => (
						<DateTimePicker
							valueFormat="DD MMM YYYY hh:mm A"
							popoverProps={{ zIndex: 1000 }}
							label="Since"
							{...field}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="interval_type"
					control={control}
					render={({ field, fieldState }) => (
						<Select
							label="Data Interval Type"
							data={
								['second', 'minute', 'hour'] satisfies Query['interval_type'][]
							}
							{...field}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					name="interval_value"
					control={control}
					render={({ field, fieldState }) => (
						<NumberInput
							allowDecimal={false}
							label="Data Interval"
							{...field}
							min={1}
							max={100}
							error={fieldState.error?.message}
						/>
					)}
				/>
			</SimpleGrid>
			<Button my="xl">Connect</Button>
			{isSubmitSuccessful && (
				<Text size="lg">Monitoring driver {getValues('driver_id')}</Text>
			)}
			{children(marks)}
		</>
	)
}
