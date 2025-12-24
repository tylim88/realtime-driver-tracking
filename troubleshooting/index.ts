import { A } from './sample1'
import { B } from './sample2'

const totalDuplicate = A.reduce((acc, item) => {
	const duplicate = B.some(
		(item_) => JSON.stringify(item) === JSON.stringify(item_),
	)
	return acc + (duplicate ? 1 : 0)
}, 0)

console.log(totalDuplicate)
