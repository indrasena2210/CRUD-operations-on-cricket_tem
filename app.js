const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initailzeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initailzeDBAndServer()

const convertDbObjectToResposneObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// API 1 GET All Players

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM
     cricket_team
    ORDER BY player_id`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResposneObject(eachPlayer)),
  )
})

//API 2 Add a new player to the Database

app.post('/players/', async (request, response) => {
  // console.log(request.body)
  const {playerName, jerseyNumber, role} = request.body

  const addPlayerQuery = `
  INSERT INTO
  cricket_team (player_name,jersey_number,role)
  VALUES(
    ${playerName},${jerseyNumber},${role}
    );
    `
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to the Team')
})

//API 3 Get a particular player based on their ID

app.get('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const getPlayerQuery = `
  SELECT *
  FROM cricket_team
  WHERE player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  res.send(convertDbObjectToResposneObject(player))
})

//API 4 Update a  player based on their ID

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `
  UPDATE 
    cricket_team
  SET 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE player_id = ${playerId};
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API 5 Delete a player from the Databse

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
  DELETE FROM 
  cricket_team 
  WHERE player_id = ${playerId};
  `
  const dbresponse = await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
