import { treaty } from '@elysiajs/eden'
import {
	Button,
	Flex,
	NumberInput,
	Select,
	SimpleGrid,
	Text,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import {
	IconCircleCheckFilled,
	IconExclamationCircleFilled,
	IconInfoCircleFilled,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { driverLocation_ws } from '#/driverLocation.ws'

type App = typeof driverLocation_ws

// @ts-expect-error https://github.com/oven-sh/bun/issues/23725
const client = treaty<App>('localhost:3001')

type Marks = { latitude: number; longitude: number; recorded_at: string }[]

export const Form = ({ children }: { children: (marks: Marks) => void }) => {
	const [marks, setMarks] = useState<Marks>([])
	const [isConnected, setIsConnected] = useState(false)
	const latestTimestamp = useRef(0)
	const wsRef = useRef<{ close: () => void }>(null)

	const { control, getValues } = useForm<{
		driver_id_numeric: number
		since: string
	}>({
		defaultValues: {
			driver_id_numeric: 1,
			since: dayjs().subtract(1, 'day').toISOString(),
		},
		mode: 'all',
	})

	return (
		<>
			<SimpleGrid cols={2} spacing="md" mb="md">
				<Controller
					name="driver_id_numeric"
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
			</SimpleGrid>
			<Flex justify="center">
				{isConnected ? (
					<Button
						my="xl"
						onClick={() => {
							setIsConnected(false)
							wsRef.current?.close()
							notifications.show({
								title: 'WebSocket Closed',
								message: `Driver ${getValues('driver_id_numeric')} connection has been closed.`,
								icon: <IconInfoCircleFilled color="blue" />,
								autoClose: 5000,
								position: 'top-right',
							})
						}}
					>
						Disconnect
					</Button>
				) : (
					<Button
						my="xl"
						bg="green"
						onClick={() => {
							const ws = client.driverLocation.subscribe({
								query: {
									driver_id_numeric: getValues('driver_id_numeric').toString(),
									since: getValues('since'),
								},
							})
							wsRef.current = ws
							ws.subscribe(({ data }) => {
								console.log('WebSocket Data:', data)
								if (data.type === 'data_old') {
									setMarks((marks) => {
										const arr = [...marks, ...data.data].sort(
											(a, b) =>
												+new Date(b.recorded_at) - +new Date(a.recorded_at),
										)
										latestTimestamp.current = +new Date(
											arr[0]?.recorded_at || '',
										)
										return arr
									})
								} else {
									setMarks((marks) => {
										// if the data is older than the latest timestamp, don't prepend it
										if (
											+new Date(data.recorded_at) <= latestTimestamp.current
										) {
											return marks
										}
										const arr = [
											{
												latitude: data.latitude,
												longitude: data.longitude,
												recorded_at: data.recorded_at,
											},
											...marks,
										]
										latestTimestamp.current = +new Date(
											arr[0]?.recorded_at || '',
										)
										return arr
									})
								}
							})
							ws.on('open', () => {
								setIsConnected(true)
								notifications.show({
									title: 'WebSocket Opened',
									message: `Driver ${getValues('driver_id_numeric')} connection has been opened.`,
									icon: <IconCircleCheckFilled color="green" />,
									color: 'green',
									autoClose: 5000,
									position: 'top-right',
								})
							})
							ws.on('error', (error) => {
								setIsConnected(false)
								notifications.show({
									title: 'WebSocket Error',
									message: `Driver ${getValues('driver_id_numeric')} connection has encountered an error. Error: ${JSON.stringify(error)}`,
									icon: <IconExclamationCircleFilled color="red" />,
									color: 'red',
									autoClose: 5000,
									position: 'top-right',
								})
							})
						}}
					>
						Connect
					</Button>
				)}
			</Flex>
			{isConnected && (
				<Text size="lg" ta="center">
					Monitoring driver {getValues('driver_id_numeric')}
				</Text>
			)}
			{children(marks)}
		</>
	)
}
