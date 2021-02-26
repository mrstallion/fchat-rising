# Changelog

## 1.10.1
*   Improved performance on highly advertised channels like LFRP
*   Fixed Rule34.xxx previews


## 1.10.0
*   Moved database queries to a web worker to gain more responsive UI
*   Fixed Gelbooru, Gfycat, Hentai-Foundry, Instagram, Twitter, and Vimeo previews
*   Fixed green names not showing up when 'show friends/bookmarks in a different colour' is selected
*   Sped up Imgur previews
*   Minor UI design adjustments for usernames with badges


## 1.9.0
*   Right click any word and select 'Look up...' to see its dictionary definition
*   Skip button for auto-post ads
*   Image tab on the character profile view now loads up faster 
*   Search results view is now more responsive while scoring profiles
*   Fixed 'unicorn match' badge color


## 1.8.0
*   Added colorblind mode (settings -> rising -> colorblind mode)


## 1.7.0
*   Option for serving ads in random order
*   Fixed Twitter previews crashing the app


## 1.6.0
*   Show number of unread notes and messages in the bottom right corner
*   Fixed max ad length for automated ads
*   Fixed 'unsure' sexual orientation to display correctly in character preview


## 1.5.0
*   Use `Ctrl+Tab`, `Ctrl+Shift+Tab`, `Ctrl+PgDown`, and `Ctrl+PgUp` to switch between character tabs
*   Better search rankings
*   Really good matches get a 'unicorn' tag
*   Relaxed matching rules for switches so that they match better against 'usually dominant' and 'usually submissive' profiles
*   Fixed IMGBB, Shadbase previews


## 1.4.1
*   Fixed some image previews showing up black


## 1.4.0
*   More configurable settings for F-Chat Rising
*   Hover mouse over a character name to see a character preview


## 1.3.0
*   Improved species search and matching
*   Toggle ads button shows up in channels list if you have set up ads for the channel
*   Ad editor is now a BBCode editor
*   Improved Tumblr previews
*   Twitter previews have been disabled for now (they crash the client)
*   Right-click character menu now displays match results
*   Fixed issues with image preview ad blocker


## 1.2.0
*   Hide/show current character profile with `Ctrl+P` or `Command+P`
*   Navigate back and forward in character profile view history


## 1.1.0
*   Upgraded to Electron 10.x
*   Upgraded to Keytar 6.x – you will need to re-enter your password
*   Added Furaffinity image previews (non-adult only)
*   Added support for species-fluid characters
*   Fixed logging out and then logging in with a new character breaking character comparison
*   Fixed friends list not updating character status


## 1.0.2
*   Fixed a caching issue that caused cache misses on character page metadata
*   Fixed rate limit issues that sometimes disconnected characters when multiple characters were connected
*   Fixed a bug in age matching
*   URL preview fixes for Redgifs, Gelbooru, Tumblr, and Gifmixxx
*   All dependencies are now up to date
*   F-Chat Rising now flushes character profiles out of its cache after 30 days
*   Age difference for 'older' and 'younger' character kinks is now 8 years


## 1.0.1
*   Enabled auto-updates for Windows; MacOS and Linux not supported, sorry!
*   Reviewed security with:
    *   [Electron Security](https://www.electronjs.org/docs/tutorial/security)
    *   [Doyensec Electron Security Checklist](https://doyensec.com/resources/us-17-Carettoni-Electronegativity-A-Study-Of-Electron-Security-wp.pdf)
    *   [Doyensec Electronegativity](https://github.com/doyensec/electronegativity)
    *   [Quasar Electron Security Concerns](https://quasar.dev/quasar-cli/developing-electron-apps/electron-security-concerns)
    *   [Reasonably Secure Electron](https://know.bishopfox.com/research/reasonably-secure-electron)
    *   [SNYK.io](https://snyk.io/) vulnerability scan [![Known Vulnerabilities](https://snyk.io/test/github/mrstallion/fchat-rising/badge.svg)](https://snyk.io/test/github/mrstallion/fchat-rising)


## 1.0.0
*   Channel Conversations
    *    Highlight ads from characters most interesting to you
    *    Hide clearly unmatched ads
*   Ad Auto-Posting
    *    Manage channel ad settings via "Tab Settings"
    *    Automatically re-post ads every 11-18 minutes (randomized) for up to 180 minutes
    *    Rotate multiple ads on a single channel by entering multiple ads in "Ad Settings"
*   Ad Ratings
    *    LFP ads are automatically rated (great/good/maybe/no) and matched against your profile
*   Private Conversations
    *    View a characters' recent ads
*   Link Previews
    *    Hover cursor over any `[url]` to see a preview of it
    *    Middle click any `[url]` to turn the preview into a sticky / interactive mode
    *    Link preview has an ad-blocker to minimize page load times and protect against unfriendly scripts 
*   Profile
    *    Kinks are auto-compared when viewing character profile
    *    Custom kink explanations can be expanded inline
    *    Custom kinks are highlighted
    *    Gender, anthro/human preference, age, sexual preference, and sub/dom preference are highlighted if compatible or incompatible
    *    Guestbook, friend, and group counts are visible on tab titles
    *    Character images are expanded inline
    *    Cleaner presentation for the side bar details (age, etc.), sorted in most relevant order
    *    Less informative side bar details (views, contact) are separated and shown in a less prominent way
    *    Cleaner guestbook view
    *    Profiles, images, guestbook posts, and groups are cached for faster view
    *    Character view tabs (overview, images, etc.) stick to the top 
*   Character Search
    *    Search results are sorted based on match scores
    *    Display match score in search results
    *    Current search filters are listed in the search dialog
    *    Search filters can be reset
    *    Search results can be filtered by species
    *    Last 15 searches are stored and can be accessed from the 'Character search' dialog
*   Character Status Message
    *    Last 10 status messages are stored and can be accessed from the 'Set status' dialog
*   General
    *    Character profiles, guestbooks, friend lists, and image lists are cached for faster access
    *    Conversation dialog can be opened by typing in a character name
    *    Message search matches character names
    *    PM list shows characters' online status as a colored icon
*   Technical Details for Nerds
    *    Upgraded to Electron 9.x
    *    Replaced `node-spellchecker` with the built-in spellchecker that ships with Electron 8+
    *    Multi-language support for spell checking (Windows only – language is autodetected on MacOS) 

