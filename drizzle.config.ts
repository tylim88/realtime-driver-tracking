import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/driver.location.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_URL || '',
	},
})
