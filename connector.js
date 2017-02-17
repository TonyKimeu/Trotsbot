var builder = require('botbuilder');
var restify = require('restify');
var dialog = require('./dialog');
var prompts = require('./prompts');

module.exports = {
    start: function () {
        var server = restify.createServer();
        server.listen(process.env.port || process.env.PORT || 3978, function() {
            console.log('listening');
        });

        var connector = new builder.ChatConnector({
             appId: process.env.MICROSOFT_APP_ID,
             appPassword: process.env.MICROSOFT_APP_PASSWORD
        });

        var bot = new builder.UniversalBot(connector);

        server.use(restify.queryParser());

        server.post('/api/messages', connector.listen());

        server.get('/oauth', (req, res, next) => {
            res.send(200, 'Paste this code into the bot: ' + req.query.code);
        });

        bot.on('conversationUpdate', (message) => {
            if (message.membersAdded) {
                message.membersAdded.forEach((identity) => {
                    if (identity.id === message.address.bot.id) {
                        bot.beginDialog(message.address, '/', dialog);
                    }
                });
            }
        });

        bot.dialog('/', [
            function (session) {
                // Send a greeting and show help.
                var card = new builder.HeroCard(session)
                    .title("TROTS")
                    .text("#SHOP #PARTY #DINE #TRAVEL")
                    .images([
                        builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png")
                    ]);
                var msg = new builder.Message(session).attachments([card]);
                session.send(msg);
                session.send("Hi... I'm the Chat bot for Trots. I can show you around..");
                session.beginDialog('/help');
            },

            function (session, results) {
                // Display menu
                session.beginDialog('/menu');
            },

            function (session, results) {
                // Always say goodbye
                session.send("Ok... See you later!");
            }
        ]);

        bot.dialog('/menu', [
            function (session) {
                builder.Prompts.choice(session, "WHat would you like to see?", "Offers|Events|Tours|Wallet|Search|About|Quit");
            },
            function (session, results) {
                if (results.response && results.response.entity != 'Quit') {
                    // Launch demo dialog
                    session.beginDialog('/' + results.response.entity);
                } else {
                    // Exit the menu
                    session.endDialog();
                }
            },
            function (session, results) {
                // The menu runs a loop until the user chooses to (quit).
                session.replaceDialog('/menu');
            }
        ]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

        bot.dialog('/help', [
            function (session) {
                session.endDialog("List of available commands:\n\n* menu - Exits conversation and returns to the menu.\n* goodbye - Ends the conversation.\n* help - Show lists of commands.");
            }
        ]);


        bot.dialog('/Offers', [
            function (session) {
                session.send("The latest offers on TROTS.");
                
                // Ask the user to select an item from a carousel.
                var msg = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([
                        new builder.HeroCard(session)
                            .title("Space Needle")
                            .subtitle("The Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                            .images([
                                builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Apple Store"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:100", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("Pikes Place Market")
                            .subtitle("Pike Place Market is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                            .images([
                                builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Apple Store"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:101", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("EMP Museum")
                            .subtitle("EMP Musem is a leading-edge nonprofit museum, dedicated to the ideas and risk-taking that fuel contemporary popular culture.")
                            .images([
                                builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/320px-Night_Exterior_EMP.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/800px-Night_Exterior_EMP.jpg"))
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Apple Store"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:102", "Select")
                            ])
                    ]);
                builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
            },
            function (session, results) {
                var action, item;
                var kvPair = results.response.entity.split(':');
                switch (kvPair[0]) {
                    case 'select':
                        action = 'selected';
                        break;
                }
                switch (kvPair[1]) {
                    case '100':
                        item = "the Space Needle";
                        break;
                    case '101':
                        item = "Pikes Place Market";
                        break;
                    case '102':
                        item = "the EMP Museum";
                        break;
                }
                session.endDialog('You %s "%s"', action, item);
            }    
        ]);

        bot.dialog('/Events', [
            function (session) {
                session.send("The latest Events on TROTS.");
                
                // Ask the user to select an item from a carousel.
                var msg = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([
                        new builder.HeroCard(session)
                            .title("FAFA Market")
                            .subtitle("Location:Purdy's Arms, \n 61 Marula Lane Nairobi, \n Nairobi County")
                            .text("Date: Sun, February 19, 2017 \n Time: 11:00 AM – 6:00 PM EAT Registration: Free")
                            
                            .images([
                                builder.CardImage.create(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F28095161%2F179671897559%2F1%2Foriginal.jpg?w=800&rect=0%2C20%2C1116%2C558&s=97f7e6d8bc3b9eea74123fe56f4b345b")
                                    .tap(builder.CardAction.showImage(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F28095161%2F179671897559%2F1%2Foriginal.jpg?w=800&rect=0%2C20%2C1116%2C558&s=97f7e6d8bc3b9eea74123fe56f4b345b")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:100", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("NAIROBI WELLNESS WALK 2017 (NAWEWA-2017)")
                            .subtitle("Location: Central Park Nairobi, Nairobi County 00100")
                            .text("Date:Sun, February 26,2017 \n Time: 7:00 AM - 10:00 AM EAT Registration: Sh.1000")
                            .images([
                                builder.CardImage.create(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27413345%2F156578130921%2F1%2Foriginal.jpg?w=800&rect=0%2C297%2C1440%2C720&s=1314c7bb611b6deb97d4d4ef0e9cfdc2")
                                    .tap(builder.CardAction.showImage(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27413345%2F156578130921%2F1%2Foriginal.jpg?w=800&rect=0%2C297%2C1440%2C720&s=1314c7bb611b6deb97d4d4ef0e9cfdc2")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:101", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("Kilimani Street Festival")
                            .subtitle("Location: Rose Avenue, \n Nairobi, Nairobi County")
                            .text("Date: Sat, February 25, 2017 Time: 11:00 AM – 6:00 PM EAT Registration: Free")
                            .images([
                                builder.CardImage.create(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27708993%2F182676404913%2F1%2Foriginal.jpg?w=800&rect=0%2C107%2C428%2C214&s=10b07e6e7b7d675c39c682f1872b646c")
                                    .tap(builder.CardAction.showImage(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27708993%2F182676404913%2F1%2Foriginal.jpg?w=800&rect=0%2C107%2C428%2C214&s=10b07e6e7b7d675c39c682f1872b646c"))
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:102", "Select")
                            ]),
                            new builder.HeroCard(session)
                            .title("Party In The Wild 2017")
                            .subtitle("Location: White Rock Resort, \n Nairobi, Nairobi County")
                            .text("Date: Sat, April 29, 2017 Time: 06:00 PM - 12:00 PM EAT Registration: Kshs 1,500")
                            .images([
                                builder.CardImage.create(session, "https://pbs.twimg.com/profile_images/685088998746943488/oWF1R3WJ.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://pbs.twimg.com/profile_images/685088998746943488/oWF1R3WJ.jpg"))
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:102", "Select")
                            ]),
                            new builder.HeroCard(session)
                            .title("The Mac Series")
                            .subtitle("Location: Carnivore Gardens, \n Nairobi, Nairobi County")
                            .text("Date: Sat, February 18, 2017 Time: 03:00 PM - 11:00 PM EAT Registration: Kshs 200")
                            .images([
                                builder.CardImage.create(session, "https://pbs.twimg.com/media/C4SwRJRWcAAOpEt.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://pbs.twimg.com/media/C4SwRJRWcAAOpEt.jpg"))
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:102", "Select")
                            ])
                    ]);
                builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
            },
            function (session, results) {
                var action, item;
                var kvPair = results.response.entity.split(':');
                switch (kvPair[0]) {
                    case 'select':
                        action = 'selected';
                        break;
                }
                switch (kvPair[1]) {
                    case '100':
                        item = "the Space Needle";
                        break;
                    case '101':
                        item = "Pikes Place Market";
                        break;
                    case '102':
                        item = "the EMP Museum";
                        break;
                }
                session.endDialog('You %s "%s"', action, item);
            }    
        ]);

        bot.dialog('/Tours', [
            function (session) {
                session.send("The latest tours on TROTS.");
                
                // Ask the user to select an item from a carousel.
                var msg = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([
                        new builder.HeroCard(session)
                            .title("EASTER HOLIDAY SPECIAL #WINE AND DINE TSAVO WEST")
                            .subtitle("ACTIVITIES -Wildlife Viewing - WW I& 2 History -Visiting Mzima springs and Shetani lava flow -Bird watching at Lake Jipe -Fishing with loca canoes -Visit to salata Hill -Visit Kws Fibre Glass - Visit Lake chala 35km away enrouting Grogams Castle")
                            .text("CHARGES Residents: Ksh 16,500 Couple:Ksh 32,500 Non Residents: $ 213")
                            .images([
                                builder.CardImage.create(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27805658%2F201037227243%2F1%2Foriginal.jpg?w=800&rect=0%2C52%2C646%2C323&s=8c88fc8d53eb84fa10c624672e5d1989")
                                    .tap(builder.CardAction.showImage(session, "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F27805658%2F201037227243%2F1%2Foriginal.jpg?w=800&rect=0%2C52%2C646%2C323&s=8c88fc8d53eb84fa10c624672e5d1989")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:100", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("Safari Getaway to Tipilikwani Mara")
                            .subtitle("ACTIVITIES: night game drives, guided bush/nature walk, balloon safari with bubbly breakfast, bush breakfasts, spa services, sundowners, bush dinners, game drives in 4 wheel drive vehicles, cultural visits, lectures on Maasai culture by resident naturalist entertainment by local Maasai warriors Enjoy free WiFi services while at the lodge Limited laundry services ")
                            .text("CHARGES Double: Ksh 9,000 Dingle: Ksh 13,000")
                            .images([
                                builder.CardImage.create(session, "https://www.porini.com/wp-content/uploads/2015/09/tipilikwani-mara-safari-camp-1352306372.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://www.porini.com/wp-content/uploads/2015/09/tipilikwani-mara-safari-camp-1352306372.jpg")),
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:101", "Select")
                            ]),
                        new builder.HeroCard(session)
                            .title("Serena Mountain Lodge")
                            .subtitle("Activities: Guided nature walks or bird-spotting in the forest. Kikuyu dance displays. Visits to the photo hide by the water hole. Wildlife watching at the waterhole. Culturally-interactive trips to local villages and/or schools, Mountain climbing, Trout fishing with lunch or high tea, Nature walk, Evening slide show, Moorland hike")
                            .text("CHARGES Double: Ksh 16,720 Dingle: Ksh 22,800")
                            .images([
                                builder.CardImage.create(session, "https://1akt4l2ekuzzzlwlj5f4wn17-wpengine.netdna-ssl.com/wp-content/uploads/2015/09/serena-mountain-lodge-1362058625.jpg")
                                    .tap(builder.CardAction.showImage(session, "https://1akt4l2ekuzzzlwlj5f4wn17-wpengine.netdna-ssl.com/wp-content/uploads/2015/09/serena-mountain-lodge-1362058625.jpg"))
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Playstore"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Apple Store"),
                                builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Windows Store"),
                                //builder.CardAction.imBack(session, "select:102", "Select")
                            ])
                    ]);
                builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
            },
            function (session, results) {
                var action, item;
                var kvPair = results.response.entity.split(':');
                switch (kvPair[0]) {
                    case 'select':
                        action = 'selected';
                        break;
                }
                switch (kvPair[1]) {
                    case '100':
                        item = "the Space Needle";
                        break;
                    case '101':
                        item = "Pikes Place Market";
                        break;
                    case '102':
                        item = "the EMP Museum";
                        break;
                }
                session.endDialog('You %s "%s"', action, item);
            }    
        ]);

        bot.dialog('/Wallet', [
            function (session){
                session.beginDialog('/ensureProfile');
            },
            function (session, results){
                session.userData.profile = results.response;
                session.send('%(name)s Here is your Trots Wallet', session.userData.profile);
                var msg = new builder.Message(session)
                    .attachments([
                        new builder.ReceiptCard(session)
                            .title('%(name)s', session.userData.profile)
                            .items([
                                builder.ReceiptItem.create(session, "$22.00", "Balance").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg")),
                                builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                            ])
                            .facts([
                                builder.Fact.create(session, "1234567898", "Order Number"),
                                builder.Fact.create(session, "VISA 4076", "Payment Method")
                            ])
                            .tax("$4.40")
                            .total("$48.40")
                    ]);
                session.send(msg);
            }
        ]);

        bot.dialog('/ensureProfile', [
            function (session, args, next){
                session.dialogData.profile = args || {};
                if (!session.dialogData.profile.name) {
                    builder.Prompts.text(session,"Enter Your Username?");
                }else{
                    next();
                }
            },
            function(session, results, next){
                if (results.response){
                    session.dialogData.profile.name = results.response;
                }
                if(!session.dialogData.profile.company){
                    builder.Prompts.text(session,"Enter Password");
                }else{
                    next();
                }
            },
            function (session, results){
                if(results.response){
                    session.dialogData.profile.company = results.response;
                }
                session.endDialogWithResult({response: session.dialogData.profile})

            }
        ]);

        bot.dialog('/Search', 
            function(session) {
                session.send('Under Construction');
        });

        bot.dialog('/About', function(session) {
            session.send('Under Construction');
            session.endDialog(msg);
        });

    }
}