const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 8000;
const date = new Date();
date.setDate(date.getDate() - 9);
const Fdate = date.toISOString().slice(0, 10);

// Set up Pug as the templating engine
app.set("view engine", "pug");

// Route to fetch football data from API
app.get("/", async (req, res) => {
  try {
    // Fetch fixtures data from the API
    const response = await axios.get(
      "https://api-football-beta.p.rapidapi.com/fixtures",
      {
        headers: {
          "x-rapidapi-host": "api-football-beta.p.rapidapi.com",
          "x-rapidapi-key":
            "API_KEY", // Replace with your RapidAPI key
        },
        params: {
          season: "2022",
          league: "39",
          date: "2023-04-01",
        },
      }
    );
    const fixtures = response.data.response;

    // Fetch standings data from the API
    const standingR = await axios.get(
      "https://api-football-beta.p.rapidapi.com/standings",
      {
        headers: {
          "x-rapidapi-host": "api-football-beta.p.rapidapi.com",
          "x-rapidapi-key":
            "API_KEY", // Replace with your RapidAPI key
        },
        params: {
          season: "2022",
          league: "39",
        },
      }
    );

    const standings = standingR.data.response[0].league.standings[0];

    // Fetch YouTube videos for each fixture
    const youtubePromises = fixtures.map(async (fixture) => {
      try {
        const videoResponse = await axios.get(
          "https://www.googleapis.com/youtube/v3/search/",
          {
            params: {
              key: "API_KEY", // Replace with your YouTube Data API key
              q: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
              part: "snippet",
              channelId: "UCD2lJITnvzflNhOqQckMpQg",
              type: "video",
              maxResults: 1,
            },
          }
        );
        return videoResponse.data.items[0];
      } catch (error) {
        console.error(error);
        return null;
      }
    });

    Promise.all(youtubePromises).then((videos) => {
      console.log(videos);
      res.render("index", { date: Fdate, fixtures, videos, standings });
    });
  } catch (error) {
    console.error(error);
  }
});

// Start the server
app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);

console.log(Fdate); // Log formatted date
console.log(date); // Log original date

