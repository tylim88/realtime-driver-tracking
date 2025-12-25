# Realtime Driver Tracking

## Setup

Note: I messed up a bit and run out of time to fix it, here we use bun instead of nodejs

### First Step

install bun https://bun.com/

window

```sh
powershell -c "irm bun.sh/install.ps1 | iex"
```

Linux / MacOS  

```sh  
curl -fsSL https://bun.sh/install | bash
```
  
### Second Step

install the dependencies

```sh
npm run setup
```

Optional: install biomejs extension for code formatting https://marketplace.visualstudio.com/items?itemName=biomejs.biome

and we are done with setup

## Run

### Servers

to run servers(there are 2 servers) and frontend

```sh
npm run dev
```

### UI

to view the frontend open http://localhost:5173

select a driver and pick a date time then click "connect"

![Alt Text](./img/preview.png)

### Generate Data

I am not sure why but I can't get continuous data from the original source, so I generate the data myself

```sh
npm run source
```