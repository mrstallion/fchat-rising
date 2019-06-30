# F-Chat Rising

This repository contains a modified version of the mainline F-Chat 3.0 client.


## Key Differences

*   Ad auto-posting
    *    Manage channel's ad settings in "Tab Settings"
    *    Automatically repost ads every 11-18 minutes (randomized)
    *    Auto-posting can rotate through multiple ads
*   Link previews
    *    Hover cursor over any `[url]` to see a preview of it
*   Profile
    *    Kinks are auto-compared when profile is loaded
    *    Custom kink explanations can be expanded inline
    *    Custom kinks are highlighted
    *    Gender, anthro/human preference, age, and sexual preference are highlighted if compatible or incompatible
    *    Guestbook, friend, and group counts are visible on tabs
    *    Character pictures are expanded inline
    *    Cleaner presentation for the side bar details (age, etc.), sorted in most relevant order
    *    Less informative side bar details (views, contact) are separated and shown in a less prominent way
    *    Cleaner guestbook view



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