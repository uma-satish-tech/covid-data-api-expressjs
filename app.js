const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const sqlite3 = require("sqlite3");

let db = null;
const initializedDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("server started running at localhost:3001");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

initializedDBAndServer();

dbObjectToResponseObject = (dbObject) => {
  return {
    population: dbObject.population,
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

// get all states

app.get("/states/", async (request, response) => {
  const allStatesQuery = `
    SELECT * FROM state;`;
  const statesArray = await db.all(allStatesQuery);
  response.send(statesArray.map((each) => dbObjectToResponseObject(each)));
});

// get state

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state WHERE state_id = ${stateId};
    `;
  const stateResult = await db.get(getStateQuery);
  response.send(dbObjectToResponseObject(stateResult));
});

// create district into district table using post method

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
        INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
        VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths})
        `;
  const dbResponse = await db.run(addDistrictQuery);
  const district_id = dbResponse.lastID;
  response.send("District Successfully Added");
});

//get district

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM district WHERE district_id = ${districtId};
    `;
  const districtResult = await db.get(getDistrictQuery);
  response.send(dbObjectToResponseObject(districtResult));
});

//delete district

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
  DELETE FROM district WHERE district_id = ${districtId};
  `;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//update district details

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDetailsQuery = `
    UPDATE district 
    SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths};
    `;
  await db.run(updateDetailsQuery);
  response.send("District Details Updated");
});

//statastics of state

// app.get("/states/:stateId/stats/", async (request, response) => {
//   const { stateId } = request.params;
//   const getStat = `
//     SELECT
//     SUM(case) as "totalCases",
//     SUM(cured) as "totalCured",
//     SUM(active) as "totalActive",
//     SUM(deaths) as "totalDeaths"
//     FROM
//     district
//     WHERE state_id = ${stateId};
//     `;
//   const statResult = await db.get(getStat);
//   console.log(statResult);
//   response.send({
//     totalCases: statResult.totalCases,
//     totalCured: statResult.totalCured,
//     totalActive: statResult.totalActive,
//     totalDeaths: statResult.totalDeaths,
//   });
// });

app.get("states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStat = `
  SELECT 
  SUM(cases),
  SUM(cured),
  SUM(active),
  SUM(deaths)
  FROM district 
  WHERE 
  state_id = ${stateId};
  ;`;
  const dbResponse = await db.get(getStat);
  console.log(dbResponse);
  response.send({
    totalCases: statResult["SUM(cases)"],
    totalCured: statResult["SUM(cured)"],
    totalActive: statResult["SUM(active)"],
    totalDeaths: statResult["SUM(deaths)"],
  });
});

module.exports = app;
