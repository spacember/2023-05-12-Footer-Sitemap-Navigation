# CMA - Footer sitemap navigation

This script creates and populates the footer section for pampers, using a full-kit as input.

### This script does the following actions in order:

1. Authenticates with CMA
2. Gets data from excel file

### To run this script

1. cd into 2023-05-12-Footer-Sitemap-Navigation
2. Run node index.js.

### config.json

1. excel - excel file to use as input
2. path - relative path to the excel file
3. sheetName - the name of the sheet to work with
4. accessToken - contentful access token (Generate your own accessToken).
5. space - contentful space information for targeted market.
6. spaceId: contentful spaceId for required market
7. environmentId: contentful environmentId for required market
8. locale: contentful local for required market (To find the local, click on Settings -> locales. You should see a default locale.)
9. contentType - contentful contentType to be used
10. entryContentType -  contenful contentType for entry;

### Re-running the script

The script should be run once.


// todo: Object.create() vs Object.assign()
