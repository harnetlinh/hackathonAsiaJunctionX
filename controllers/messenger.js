const request = require('request')
exports.handleMessengerWebhook = (req, res) => {
	let body = req.body;

	// Checks this is an event from a page subscription
	if (body.object === 'page') {

		// Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function (entry) {

			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);


			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender PSID: ' + sender_psid);

			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message);
			} else if (webhook_event.postback) {
				handlePostback(sender_psid, webhook_event.postback);
			}

		});

		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	} else {
		// Returns a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}
}
exports.verifyMessengerWebhook = (req, res) => {
	// Your verify token. Should be a random string.
	let VERIFY_TOKEN = process.env.MESSENGER_WEBHOOK_TOKEN

	// Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Checks if a token and mode is in the query string of the request
	if (mode && token) {

		// Checks the mode and token sent is correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Responds with the challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
}


// Handles messages events
function handleMessage(sender_psid, received_message) {
	let response;

	// Checks if the message contains text
	if (received_message.text == 'what is area?') {
		// Create the payload for a basic text message, which
		// will be added to the body of our request to the Send API
		response = {
			"text": "E=mc2 is that correct?"
		}
	}
	else if(received_message.text == 'what is math?')
	{
		response ={
			"text": "i dont know"
		}
	
	} else if (received_message.attachments) {
		// Get the URL of the message attachment
		let attachment_url = received_message.attachments[0].payload.url;
		response = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"elements": [{
						"title": "Is this the right picture?",
						"subtitle": "Tap a button to answer.",
						"image_url": attachment_url,
						"buttons": [
							{
								"type": "postback",
								"title": "Yes!",
								"payload": "yes",
							},
							{
								"type": "postback",
								"title": "No!",
								"payload": "no",
							}
						],
					}]
				}
			}
		}
	}

	// Send the response message
	callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
	let response;

	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	if (payload === 'yes') {
		response = {"text": "Thanks!"}
	} else if (payload === 'no') {
		response = {"text": "Oops, try sending another image."}
	}
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	console.log('reply to ', sender_psid)
	// Construct the message body
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": response
	}

	// Send the HTTP request to the Messenger Platform
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": {"access_token": process.env.PAGE_ACCESS_TOKEN},
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log('message sent!')
		} else {
			console.error("Unable to send message:" + err);
		}
	});
}
exports.sendTest = (req,res)=>{
	console.log("RUN SEND TEST")
	res = sendQues();
}
function sendQues(){
	//2969551113140467
	var sender_psid = "2969551113140467"
	console.log('reply to ', sender_psid)

	var content = {
		"text": "Pick a color:",
		"quick_replies":[
		  {
			"content_type":"text",
			"title":"Red",
			"payload":"Red",
			"image_url":"http://example.com/img/red.png"
		  },{
			"content_type":"text",
			"title":"Green",
			"payload":"Green",
			"image_url":"http://example.com/img/green.png"
		  }
		]
	  }
	// Construct the message body
	let request_body = {
		"recipient": {
			"id": sender_psid
		},
		"message": content,
		"messaging_type": "UPDATE",
	}

	// Send the HTTP request to the Messenger Platform
	return request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": {"access_token": process.env.PAGE_ACCESS_TOKEN},
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
		if (!err) {
			console.log(res)
			console.log("SUCCESSFUL")
		} else {
			console.log("FAIL")
		}
	});
	// https://graph.facebook.com/v7.0/me/messages?access_token=<PAGE_ACCESS_TOKEN>
}
