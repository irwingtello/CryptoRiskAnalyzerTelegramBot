// Dependencies
const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const url = "https://api.telegram.org/bot";
const apiToken = process.env.TOKEN;
const port = process.env.PORT || 3000;

// Configurations
app.use(bodyParser.json());

// Endpoints
app.post('/', async (req, res) => {
  //Logs
  console.log("-------");
  console.log(req.body);
  console.log("-------");

  let chatId = undefined;
  let sentMessage = undefined;

  if (req.body.message) {
    chatId = req.body.message.chat?.id;
    sentMessage = req.body.message.text;
  } else if (req.body.my_chat_member) {
    chatId = req.body.my_chat_member.chat?.id;
  }

  if (chatId === undefined) {
    res.status(200).send({});
    return;
  }

  if (sentMessage === undefined || !sentMessage.match(/\/verifyETH (.+)/)) {
    res.status(200).send({});
    return;
  }
  else
  {
     try {
          let parameter = sentMessage.match(/\/verifyETH (.+)/)[1];
          let data = JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "mt_addressRiskScore",
            params: [
              {
                chain: "ETH",
                address: parameter,
              },
            ],
          });
    
          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: process.env.URL,
            headers: {
              "Content-Type": "application/json",
            },
            data: data,
          };
    
          await axios
            .request(config)
            .then((response) => {
              const jsonPretty = JSON.stringify(response.data.result, null, 2);
              const text =
                `Here is your result:\n\n<pre>${jsonPretty}</pre>\n\nHere are some useful links:\n\n` +
                "MistTrack AML API on QuickNode Marketplace: https://marketplace.quicknode.com/add-on/misttrack-aml-api\n\n" +
                "API Endpoints: Get Risk Score - Risk Descriptions: https://docs.misttrack.io/api-endpoints/get-risk-score#risk-descriptions-for-detail_list\n\n" +
                "API Endpoints: Get Risk Score - Risk Level Guide: https://docs.misttrack.io/api-endpoints/get-risk-score#risk-level-guide";
              axios
                .post(`${url}${apiToken}/sendMessage`, {
                  chat_id: chatId,
                  text: text,
                  parse_mode: "HTML", // Set parse_mode to "HTML"
                })
                .then((response) => {
                  res.status(200).send(response);
                  return;
                })
                .catch((error) => {
                  res.send(error);
                  return;
                });
            })
            .catch((error) => {
              res.send(error);
              return;
            });
        } catch (error) {
          res.send(error);
          return;
        }
  }
});

// Listening
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
