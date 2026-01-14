import { treaty } from '@elysiajs/eden'
import { Button, Flex, NumberInput, SimpleGrid, Text } from '@mantine/core'
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
import { useStoreMarks } from '@/store'

// https://github.com/oven-sh/bun/issues/23725
// you will not see the type error if you open the frontend folder in new workbench
const client = treaty<ReturnType<typeof driverLocation_ws>>('localhost:3001')

export const Form = () => {
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
								if (data.type === 'data_old') {
									useStoreMarks.setState((state) => {
										latestTimestamp.current = +new Date(
											data.data[0]?.recorded_at || '',
										)

										state.marks = data.data
									})
								} else {
									useStoreMarks.setState((state) => {
										// if the data is older than the latest timestamp, don't prepend it
										if (+new Date(data.recorded_at) <= latestTimestamp.current)
											return
										const arr = [
											{
												latitude: data.latitude,
												longitude: data.longitude,
												recorded_at: data.recorded_at,
											},
											...state.marks,
										]
										latestTimestamp.current = +new Date(
											arr[0]?.recorded_at || '',
										)
										state.marks = arr
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
		</>
	)
}
