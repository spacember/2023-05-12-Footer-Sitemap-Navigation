# Footer sitemap navigation

This script creates an array of entries (categories). Then the field sitemap navigation is updated with the created entries.

### This script does the following actions in order:

1. Gets the environment.
2. Extracts categories from the full-kit.
3. Creates the categorie entries.
4. Updates the field with the created entries.

### To run this script

1. cd into 2023-05-12-Footer-Sitemap-Navigation
2. Run node index.js.

### config.json

1. accessToken - contentful access token (Generate your own accessToken).
2. space - contentful space information for targeted market.
3. spaceId - contentful spaceId for required market
4. environmentId: contentful environmentId for required market
5. locale - contentful local for required market (To find the local, click on Settings -> locales. You should see a default locale.)
6. footerId - the id of the footer to update.
7. excel - excel file to use as input.
8. path - relative path to the excel file.
9. sheetName - the name of the sheet to work with.
