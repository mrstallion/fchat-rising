# F-Chat Rising

This repository contains a heavily customized version of the mainline F-Chat 3.0 client.


## Key Differences

1. **Profile matching** automatically compares your profile with others to determine with whom you are compatible.
1. **Automatic ad posting** repeatedly posts and rotates ads on selected channels.
1. **Link previews** pop up shows a preview of an image when you hover your mouse over a link.


### More Details

*   Ads view
    *    Highlight ads from characters most interesting to you
    *    Hide clearly unmatched ads
    *    View characters' recent ads
*   Ad auto-posting
    *    Manage channel ad settings via "Tab Settings"
    *    Automatically re-post ads every 11-18 minutes (randomized) for up to 180 minutes
    *    Rotate multiple ads on a single channel by entering multiple ads in "Tab Settings"
*   Ad ratings
    *    LFP ads are automatically rated and matched against your profile
*   Link previews
    *    Hover cursor over any `[url]` to see a preview of it
    *    Middle click any `[url]` to turn the preview into a sticky / interactive mode
*   Profile
    *    Kinks are auto-compared when viewing character profile
    *    Custom kink explanations can be expanded inline
    *    Custom kinks are highlighted
    *    Gender, anthro/human preference, age, sexual preference, and sub/dom preference are highlighted if compatible or incompatible
    *    Guestbook, friend, and group counts are visible on tabs
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
*   General
    *    Character profiles, guestbooks, friend lists, and image lists are cached for faster access.
    *    Conversation dialog can be opened by typing in a character name
    *    Message search also checks character names


## How to Set Up Ads

1. Open a conversation channel of your preference, such as `#LFRP`
1. Click `Tab Settings`
1. Enter one or more `Channel Auto-Posting Ads`
1. Click `Save settings`
1. Click `Auto-Post Ads`


## FAQ

1. The more information you have in your profile (**non-custom** kinks in particular), the better the matching quality will be.
1. Non-binary gender preference matching relies on kinks. For example, if your non-binary character has a preference for females, make sure 'females' are listed as a favorite kink.
1. 'Underage' kink is considered to apply to characters aged 16 or above; 'ageplay' kink is considered to apply to characters aged 16 or below.
1. 'Older characters' and 'younger characters' kink preferences are interpreted as age difference of 5+ years.
1. Comparison results will get faster over time, as more and more character data is cached.


## Todo / Ideas

*   Collect data on ads / responses to determine which ads work best
*   Preview mode should allow detaching from the main window
*   Split chat view
*   Improve log browsing
*   Reposition ad settings and toggle
*   Save character's status messages
*   Conversation bot API
*   Filter unmatching ads is not channel specific -- it's either on everywhere or nowhere
*   Fix e621 URLs
*   AD UI Cleanup / hide to popovers
*   Reset preview mode
*   Better image fitting & loading animation


# F-List Exported
This repository contains the open source parts of F-list and F-Chat 3.0.
All necessary files to build F-Chat 3.0 as an Electron, mobile or web application are included.

## Setting up a Dev Environment
 - Clone the repo
 - Install [Yarn](https://yarnpkg.com/en/docs/install)
 - Change into the cloned directory and run `yarn install`. If you only want to make a custom theme, you do not need to do this!
 - IntelliJ IDEA is recommended for development.
 
## Building for Electron
 - To build native Node assets, you will need to install Python 2.7 and the Visual C++ 2015 Build tools. [More information can be found in the node-gyp docs.](https://github.com/nodejs/node-gyp#installation)
 - Change into the `electron` directory.
 - Run `yarn build`/`yarn watch` to build assets. They are placed into the `app` directory.
 - Run `yarn start` to start the app in debug mode. Use `Ctrl+Shift+I` to open the Chromium debugger.


### Building on Windows

```
npm install --global --production --vs2015 --add-python-to-path windows-build-tools node-gyp
```

### Packaging
See https://electron.atom.io/docs/tutorial/application-distribution/
 - Run `yarn build:dist` to create a minified production build.
 - Run `yarn run pack`. The generated installer is placed into the `dist` directory.
   - On Windows you can add the path to and password for a code signing certificate as arguments.
   - On Mac you can add your code signing identity as an argument. `zip` is required to be installed.
   - On Linux you can add a GPG key for signing and its password as arguments. `mksquashfs` and `zsyncmake` are required to be installed.

## Building for Mobile
 - Change into the `mobile` directory.
 - Run `yarn build`/`yarn watch` to build assets. They are placed into the `www` directory.
 - For Android, change into the `android` directory and run `./gradlew assembleDebug`. The generated APK is placed into `app/build/outputs/apk`.
 - For iOS, change into the `ios` directory and open `F-Chat.xcodeproj` using XCode. From there, simply run the app using the play button.

## Building for Web
 - Change into the `webchat` directory.
 - Run `yarn build`/`yarn watch` to build assets. They are placed into the `dist` directory.
 - The compiled main.js file can be included by an HTML file that is expected to provide a global `const chatSettings: {account: string, theme: string, characters: ReadonlyArray<string>, defaultCharacter: string | null};`. It should also normalize the page to 100% height.

## Building a custom theme
See [the wiki](https://wiki.f-list.net/F-Chat_3.0/Themes) for instructions on how to create a custom theme.
 - Change into the `scss` directory.
 - Run `yarn install`.
 - Run `yarn build themes/chat/{name}.scss`.
 - Your theme file will be placed into the `scss/css` directory.

## Dependencies
Note: Adding *and upgrading* dependencies should only be done with prior consideration and subsequent testing.

That's why `yarn.lock` exists and is version controlled.

To upgrade NPM dependencies, run `yarn upgrade` locally. Run `yarn outdated` to see pending upgrades.
