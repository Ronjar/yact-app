# YACT

YACT (yet another clipboard tool) creates a simple, browser based board to share data between devices in the same yact session.
Ever had a friend over and you wanted to use their Netflix account but as they are a responsible adult, the password isn't Hello123?
Ever wanted to sign into a personal account at work, but didn't want to log into your password manager there?
This is what I created YACT for.
All data is session based and only held in RAM (Currently except for files, which are stored inside the container file system). No permanent storage ads, trackers, completely open source.

![Screenshot of YACT session](/pictures/session.png)
*More screenshots in the [pictures](/pictures)* folder.

## Features
- Create a session on one device and joint with all other devices by either code or invitation.
- Live updates using websockets. Adding messages, media, inviting devices or closing a session, everything happens live.
- Joining by code: Just use a e.g. 6 digit code to join the session (after verification by admin)
- Joining by invitiation: Simply click *"Invite User"* and add your devices without putting in the domain or verifying them afterwards.
- All your files can be uploaded: Not only your passwords, but also pictures, documents, etc. can be shared.
- Control everything from a small sidebar: Inviting users, acception requests or deleting the session. All done via the admin sidebar.
- Share your content: Just press share from the context menu and use your content directly with the link copied to your clipboard. For example in a terminal window using curl.

## Installation
### Using Docker Compose (recommended)
This docker file below is all you need to get started. For features like sharing to work properly, configure the base URL to the URL you made it publicly available without any trailing slashes etc. 
```yaml
services:
  yact:
    image: ghcr.io/Ronjar/yact-app:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PUBLIC_BASE_URL=https://yact.example.com
```

### Manual
1. Clone this repository to your server.
    ```
    git clone https://github.com/Ronjar/yact-app.git
    ```
2. Build the project, using npm (node >= 24 required)
    ```
    npm run build
    ```
3. start the program (Port 3000 has to be available)
    ```
    npm start
    ```

## Configuration
There are several environment variables you can use to configure YACT.
| Variable | Default value | Purpose |
| -------- | ------------- | ------- |
| `PUBLIC_BASE_URL` | - | The base URL without trailing slashes (e.g.) |
| `PUBLIC_SESSION_CODE_LENGTH` | 6 | The length of the session code you use to join a session. |
| `PUBLIC_SHARE_CODE_LENGTH` | 6 | The length of the code used to share an entry publicly (without authentication) |
| `PUBLIC_INVITE_TOKEN_LENGTH` | 24 | The length of the one time token to invite users without manual verification |
| `PUBLIC_EXPIRY_TIMER_SECONDS` | 600 | The number of secons after which a session is closed after **everyone** left it |

Also it is recommended to increase the default content length (so the upload size of file), because the node default is only 524288 bytes. To do this, set the `BODY_SIZE_LIMIT` variable to e.g. *10M* or if you ant to disable the rule, to *Infinity*.


## Why YACT and not X?
 While other tools like Karakeep, Linkwarden, Taildrop or Hedgedoc (Tools I use and love) also cover this functionality and much more I wanted a simplistic alternative without too much overhead. With the concept of sessions and no user accounts this app is very good at one specific thing. Sharing content in a short lived session between devices. If you also need something like this, just give it a try.

 ## Roadmap
 As this is a pretty minimalistic project, there are only a few things currently on the roadmap
 - adding an upload progress bar for larger files
 - refactoring the code base and standardizing the UI
 - i18n, so language translation
 - End to end encryption (which I probably won't do, because it's pretty much a complete rewrite)

 If you want to help me with anything or have an idea, just open an issue or write me at yact@robingebert.com.