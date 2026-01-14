import { client } from './__client'

type State = {
	marks: { latitude: number; longitude: number; recorded_at: string }[]
}
export const useStoreMarks = client<State>(
	() => {
		return {
			marks: [],
		}
	},
	{
		name: 'marks',
	},
)
