const axios = require("axios");
const crypto = require("crypto");

const LOG_URL = "http://fetch.336699bet.com";
const SECRET_KEY = "9332fd9144a3a1a8bd3ab7afac3100b0";
const operatorcode = "rbdb";

exports.launchGame = async (req, res) => {
  console.log("Received launch game request with query:", req.query);

  try {

    const { username, password, type, providercode, gameid = 0 } = req.query;

    if (!username || !password || !type || !providercode) {
      return res.status(400).json({
        error: "username, password, type, providercode required"
      });
    }

    const signature = createSignature(
      operatorcode,
      password,
      providercode,
      type,
      username,
      SECRET_KEY
    );

    const response = await axios.get(`${LOG_URL}/launchGames.aspx`, {
      params: {
        operatorcode,
        providercode,
        username,
        password,
        type,
        gameid,
        lang: "en-US",
        html5: 1,
        signature
      }
    });

    res.json(response.data);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Launch game failed"
    });

  }

};

function createSignature(
  operatorcode,
  password,
  providercode,
  type,
  username,
  secret
) {

  const raw =
    operatorcode +
    password +
    providercode +
    type +
    username +
    secret;

  return crypto
    .createHash("md5")
    .update(raw)
    .digest("hex")
    .toUpperCase();
}