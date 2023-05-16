# Contentful Management Api - full-kit

A full-kit given by *Melanie Bouic*, although not a complete full kit.

### This script does the following actions in order:

1. Authenticates with CMA
2. Gets data from excel file
3. Creates a list of entries of contentType 'link'
4. Creates a field which accepts an array of contentType 'link'

### To run this script

1. cd into 'full kit'
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
