# Gradable

Gradable makes grading websites easy. Made for the _CS 329E: Elements of Web Programming_ course at The University of Texas at Austin.

## Features

-   Faster grading of assignments by reusing previous comments
-   Automatically load embedded submission to be grade
-   Automatic checking of last modification time of included files
-   Automatic grade calculation

## Usage

You will need to copy a script to your university web space and install a browser extension. Open this page and follow the instructions.

## CI setup

The following secrets should be configured in GitHub:

1. The Chrome `EXTENSION_ID` (see URL).
1. `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` from [Google APIs](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md).
1. `WEB_EXT_API_KEY`, and `WEB_EXT_API_SECRET` from [AMO](https://addons.mozilla.org/en-US/developers/addon/api/key).
1. `ACCESS_TOKEN` from [GitHub](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).
