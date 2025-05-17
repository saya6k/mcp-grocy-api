# Grocy API Reference

> Auto-generated from https://demo.grocy.info/api/openapi/specification on 2025-05-17T16:56:10.327Z

| Path | Method | Summary |
|------|--------|---------|
| /batteries | GET | Returns all batteries incl. the next estimated charge time per battery |
| /batteries/charge-cycles/{chargeCycleId}/undo | POST | Undoes a battery charge cycle |
| /batteries/{batteryId} | GET | Returns details of the given battery |
| /batteries/{batteryId}/charge | POST | Tracks a charge cycle of the given battery |
| /batteries/{batteryId}/printlabel | GET | Prints the Grocycode label of the given battery on the configured label printer |
| /calendar/ical | GET | Returns the calendar in iCal format |
| /calendar/ical/sharing-link | GET | Returns a (public) sharing link for the calendar in iCal format |
| /chores | GET | Returns all chores incl. the next estimated execution time per chore |
| /chores/executions/calculate-next-assignments | POST | (Re)calculates all next user assignments of all chores |
| /chores/executions/{executionId}/undo | POST | Undoes a chore execution |
| /chores/{choreIdToKeep}/merge/{choreIdToRemove} | POST | Merges two chores into one |
| /chores/{choreId} | GET | Returns details of the given chore |
| /chores/{choreId}/execute | POST | Tracks an execution of the given chore |
| /chores/{choreId}/printlabel | GET | Prints the Grocycode label of the given chore on the configured label printer |
| /files/{group}/{fileName} | GET | Serves the given file |
| /files/{group}/{fileName} | PUT | Uploads a single file |
| /files/{group}/{fileName} | DELETE | Deletes the given file |
| /objects/{entity} | GET | Returns all objects of the given entity |
| /objects/{entity} | POST | Adds a single object of the given entity |
| /objects/{entity}/{objectId} | GET | Returns a single object of the given entity |
| /objects/{entity}/{objectId} | PUT | Edits the given object of the given entity |
| /objects/{entity}/{objectId} | DELETE | Deletes a single object of the given entity |
| /print/shoppinglist/thermal | GET | Prints the shoppinglist with a thermal printer |
| /recipes/fulfillment | GET | Get stock fulfillment information for all recipe |
| /recipes/{recipeId}/add-not-fulfilled-products-to-shoppinglist | POST | Adds all missing products for the given recipe to the shopping list |
| /recipes/{recipeId}/consume | POST | Consumes all in stock ingredients of the given recipe (for ingredients that are only partially in stock, the in stock amount will be consumed) |
| /recipes/{recipeId}/copy | POST | Copies a recipe |
| /recipes/{recipeId}/fulfillment | GET | Get stock fulfillment information for the given recipe |
| /recipes/{recipeId}/printlabel | GET | Prints the Grocycode label of the given recipe on the configured label printer |
| /stock | GET | Returns all products which are currently in stock incl. the next due date per product |
| /stock/barcodes/external-lookup/{barcode} | GET | Executes an external barcode lookoup via the configured plugin with the given barcode |
| /stock/bookings/{bookingId} | GET | Returns the given stock booking |
| /stock/bookings/{bookingId}/undo | POST | Undoes a booking |
| /stock/entry/{entryId} | GET | Returns details of the given stock |
| /stock/entry/{entryId} | PUT | Edits the stock entry |
| /stock/entry/{entryId}/printlabel | GET | Prints the Grocycode / stock entry label of the given entry on the configured label printer |
| /stock/locations/{locationId}/entries | GET | Returns all stock entries of the given location |
| /stock/products/by-barcode/{barcode} | GET | Returns details of the given product by its barcode |
| /stock/products/by-barcode/{barcode}/add | POST | Adds the given amount of the by its barcode given product to stock |
| /stock/products/by-barcode/{barcode}/consume | POST | Removes the given amount of the by its barcode given product from stock |
| /stock/products/by-barcode/{barcode}/inventory | POST | Inventories the by its barcode given product (adds/removes based on the given new amount) |
| /stock/products/by-barcode/{barcode}/open | POST | Marks the given amount of the by its barcode given product as opened |
| /stock/products/by-barcode/{barcode}/transfer | POST | Transfers the given amount of the by its barcode given product from one location to another (this is currently not supported for tare weight handling enabled products) |
| /stock/products/{productIdToKeep}/merge/{productIdToRemove} | POST | Merges two products into one |
| /stock/products/{productId} | GET | Returns details of the given product |
| /stock/products/{productId}/add | POST | Adds the given amount of the given product to stock |
| /stock/products/{productId}/consume | POST | Removes the given amount of the given product from stock |
| /stock/products/{productId}/entries | GET | Returns all stock entries of the given product in order of next use (Opened first, then first due first, then first in first out) |
| /stock/products/{productId}/inventory | POST | Inventories the given product (adds/removes based on the given new amount) |
| /stock/products/{productId}/locations | GET | Returns all locations where the given product currently has stock |
| /stock/products/{productId}/open | POST | Marks the given amount of the given product as opened |
| /stock/products/{productId}/price-history | GET | Returns the price history of the given product |
| /stock/products/{productId}/printlabel | GET | Prints the Grocycode label of the given product on the configured label printer |
| /stock/products/{productId}/transfer | POST | Transfers the given amount of the given product from one location to another (this is currently not supported for tare weight handling enabled products) |
| /stock/shoppinglist/add-expired-products | POST | Adds expired products to the given shopping list |
| /stock/shoppinglist/add-missing-products | POST | Adds currently missing products (below defined min. stock amount) to the given shopping list |
| /stock/shoppinglist/add-overdue-products | POST | Adds overdue products to the given shopping list |
| /stock/shoppinglist/add-product | POST | Adds the given amount of the given product to the given shopping list |
| /stock/shoppinglist/clear | POST | Removes all items from the given shopping list |
| /stock/shoppinglist/remove-product | POST | Removes the given amount of the given product from the given shopping list, if it is on it |
| /stock/transactions/{transactionId} | GET | Returns all stock bookings of the given transaction id |
| /stock/transactions/{transactionId}/undo | POST | Undoes a transaction |
| /stock/volatile | GET | Returns all products which are due soon, overdue, expired or currently missing |
| /system/config | GET | Returns all config settings |
| /system/db-changed-time | GET | Returns the time when the database was last changed |
| /system/info | GET | Returns information about the installed Grocy version, PHP runtime and OS |
| /system/localization-strings | GET | Returns all localization strings (in the by the user desired language) |
| /system/log-missing-localization | POST | Logs a missing localization string |
| /system/time | GET | Returns the current server time |
| /tasks | GET | Returns all tasks which are not done yet |
| /tasks/{taskId}/complete | POST | Marks the given task as completed |
| /tasks/{taskId}/undo | POST | Marks the given task as not completed |
| /user | GET | Returns the currently authenticated user |
| /user/settings | GET | Returns all settings of the currently logged in user |
| /user/settings/{settingKey} | GET | Returns the given setting of the currently logged in user |
| /user/settings/{settingKey} | PUT | Sets the given setting of the currently logged in user |
| /user/settings/{settingKey} | DELETE | Deletes the given setting of the currently logged in user |
| /userfields/{entity}/{objectId} | GET | Returns all userfields with their values of the given object of the given entity |
| /userfields/{entity}/{objectId} | PUT | Edits the given userfields of the given object of the given entity |
| /users | GET | Returns all users |
| /users | POST | Creates a new user |
| /users/{userId} | PUT | Edits the given user |
| /users/{userId} | DELETE | Deletes the given user |
| /users/{userId}/permissions | GET | Returns the assigned permissions of the given user |
| /users/{userId}/permissions | POST | Adds a permission to the given user |
| /users/{userId}/permissions | PUT | Replaces the assigned permissions of the given user |