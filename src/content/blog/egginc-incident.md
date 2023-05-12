---
title: "Unscrambling the Egg, Inc. Incident"
description: "Delve into the Egg, Inc. incident where a complex interaction with a community tool leads to an unforgettable saga and the end of the mioi Egg, Inc. companion app."
date: 2023-05-12T12:49:00+12:00
# lastUpdated: 2023-02-08T00:03:00+13:00
image:
  url: "/assets/images/blog/egginc-incident.png"
  alt: "Blog post banner image"
draft: false
author: "Tom van Dinther"
tags: ["Egg, Inc.", "Incident"]
categories: ["Cautionary Tale"]
featured: true
---
Egg, Inc. is a mobile game on Android and iOS in the idle genre. You build and upgrade a farm housing chickens to lay eggs ranging from standard edible eggs to eclectic eggs that can warp space and time. The game has an online feature in the form of contracts where players can co-operatively lay eggs to reach common goals for rewards. The game also includes a cloud save feature, which will be the at the center of this tale. I developed a range of 3rd party tools for the community as a companion to this game. These tools allow players to perform what-if calculations, track co-operatives, and the newest feature to make it to my [companion app](https://egginc.mioi.io) is a dashboard to provide a convenient overview to the player.

## The Companion App

The companion app was a rewrite of an earlier set of tools. It started with a [simple farm value calculator](https://mioi.io/projects/egginc-farmvalue-simple/) to perform what-if calculations. I then added a [contract calculator](https://mioi.io/projects/egginc-contract/) which started off simple and soon had the addition of contract search. I then rewrote the [farm value calculator](https://mioi.io/projects/egginc-farmvalue/) into a more user-friendly interface. At this stage I had already been in contact with the game developer to discuss changes in their farm value formula to keep my calculators accurate. He had expressed enthusiasm with the community project, and was implicitly aware of the usage of his public game backend by 3rd parties.

The companion app runs as a progressive web app (PWA), and gets it data from the game's servers. The game servers communicate with game clients using Google Protocol Buffers, so my system architecture includes a component I call the *proxy API*. The proxy API emulates a game client by making calls using the latest protocol buffer schemas for its payloads, and translates the responses into its own contract serialising the payloads as JSON for easy consumption on the web client.

At this stage, the companion app utilises the game backend for two data calls. The first is a request for a contract, given a contract ID and a co-operative ID, the API could fetch the data for the co-operative to display on the page. The second is a request for player data to display information on the dashboard such as whether the daily gift has been claimed, the contract co-operatives the player is a part of, and current farm details which were used to pre-populate the farm value calculator. Naturally, the player data required a player ID to fetch this data. The companion app allowed players to enter their player ID (discoverable through the in-game menus) which was saved to local storage to be included with the player data requests.

## The Player ID

The primary purpose for the game backend offering player data is to enable a cloud save feature. To identify a player for this purpose the game developer initially decided to use an ID offered by the OS-native game service, Google Play Services for Android and Game Center for iOS. That was until February 2021, when a large game update was released. The game developer decided to switch to using their own *Egg, Inc.* ID which required a migration strategy.

Let's back up a second and think about how we might architect a cloud save feature which could be used to restore a game session on a new device. The first thing we definitely need is a method to identify which player's data we are concerned with. The second thing we will need is a way to determine whether we are performing a cloud save or a cloud sync. A cloud save is a *push* action, using the device data as the source of truth. Whereas a cloud sync is a *pull* action, using the cloud data as the source of truth. A straight-forward approach to this could be to store a device ID alongside the player data as an active device and have player data requests include their device ID. Now the game client can decide to perform a cloud save when the device IDs match, and a cloud sync when they don't.

So what did my proxy API emulating a game client identify as? I treated this field as a user agent and populated all of my requests with a string identifying my website's backend as the source.

## The Incident

Now the stage is set, here comes the disaster. The game developer opted for an ad-hoc migration strategy for the new player IDs where new IDs were created on an as-needed basis and saved to the player data whenever a data sync occurred. What this meant was that whenever a player opened my dashboard before they updated and launched the actual game client, their player data received a new Egg, Inc. player ID tied to my user agent string as the device ID.

Now, when the player updated and launched the game, the attempt to cloud sync would fail as both ties to the device; the old player ID and the device ID are no longer valid. This detachment of the player backups effectively erased their cloud save.

This issue unfolded at the height of my companion app's popularity, with over 10,000 unique monthly users. I realised what was happening about a day after the highly anticipated game update, when the developer issued a notification about an ongoing issue with loss of cloud backups. At the same time, I noticed an outage on my dashboard. Player data was no longer able to be fetched. After a brief investigation, I discovered that requests specifically using my user agent string were blocked. It dawned on me then: the feature I had developed was inadvertantly causing the loss of data backups. I immediately pushed a [commit](https://github.com/tvandinther/mioi_egginc_app/commit/cea8a8152f274490b2bdaab4ec12cc566d33526e) disabling the feature on my end as well.

I think back to a decision I made early on in the development of the proxy API. I was deciding between randomising a device ID with a similar shape to spoof the requests, or to make a static user agent to clearly indicate my proxy API as the emulating "device". Given that both approaches worked, I opted for the static user agent to be as transparent as possible. Luckily this was the decision I went with. I can imagine a scenario where disassociated backups are extremely difficult to identify due to random spoofed device IDs.

## The Aftermath

Following this incident it became clear that a separate API would be beneficial for the continued support of community projects in a safe manner. I reached out to the developer to ask about improved communication and collaboration with third party developers.

> From: Tom
> 
> To: Auxbrain Inc.
> 
> I am Tom who runs the community website at egginc.mioi.io. For the past 2 years, as you may already know, some other community members and I have been making use of the protobuf communications with the Egg, Inc. servers to build our tools. Recently I have noticed that the access to these tools has changed, specifically for my website at mioi.io. I worry that the usage of these protobuf communications has caused issues to prompt the changes.
> 
> I would like to open a dialogue about how bots and community websites such as egginc.mioi.io can exist alongside the game. It would be great if third party creators had a reliable and safe means to provide tools and content for the community. I look forward to your response.

> From: Auxbrain Inc.
>
> To: Tom
>
> Unfortunately, the mioi bot caused tremendous data loss and backup confusion and will not be supported.

A disappointing response, and the end of an era. Not wishing to circumvent the blocks placed on my proxy API, this meant that the dashboard feature would stay disabled indefinitely. Future planned features for the companion app leaned on this access, so it made sense to cease support for the application.

## The Lessons

To start with the obvious: please for the love of good systems design, do not create side effects from data reads. [Command Query Seperation](https://en.wikipedia.org/wiki/Command%E2%80%93query_separation) has been a published concept since 1997, and it is still extremely solid advice. Subsequent queries should be repeatable and identical. As for the migration strategy, an ad hoc approach could be viable if a separate migration command was used to initiate the migration. Alternatively, pre-assign new IDs to all player data records in an atomic migration if feasible.

Good system design and software development practices allow you to build resilient systems in a vacuum, but incidents can also be mitigated culturally. You can never plug every hole, so pairing a cultural strategy to risk mitigation is essential. In this scenario, fostering an open dialogue with the community and third party developers would allow the developer to understand how their systems are being used. This information could be used to influence decisions that could have significant impact. Would the game developer have made the same decisions had they been more aware of how I was using their protobuf API?

Good communication in the other direction is also important. Had I been brought into the loop for what was happening with the game development, I could have brought up issues or have my proxy API operate differently. The community are essentially grey hat hackers. They are pragmatic and hack a system without a malicious intent, but only to provide a useful tool. Bringing this group into the loop puts everything into the open for all parties. Allowing a group of grey hat hackers to exist in your product's eco-system increases your operational risk, and can be mitigated culturally.

## The Conclusion

This incident was interesting learning experience for me. At the time, I was trying to piece the story together as I discovered new information. The discovery process was interesting but I still have questions to this day. The exact ID migration process and impact it had on the data loss is still uncertain. I would love to dive into a proper post-incident review for this as I am sure we could learn a lot more technical details. The process of recounting the incident while drafting the outline for this post uncovered even more learnings.

Although this incident marked the end of a 3-year jounrey, I greatly enjoyed developing Egg, Inc. tools for the community. I started the project in 2018 with minimal coding experience. The evolution of the mioi Egg, Inc. tools stands as milestones in my progression as a software developer through to its demise in 2021. I owe my abilities to the many nights spent writing code after my days at university. Developing these tools out of passion for the game and for the community who benefited so greatly. Lastly, I am grateful for this juicy cautionary tale about the importance of considering side effects in system design, fostering open communication with third-party developers, and maintaining awareness of how our creations are used in the broader ecosystem.

Please mind your side effects.