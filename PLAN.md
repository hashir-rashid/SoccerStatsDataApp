# Project Requirements
## Back End
1. User Auth: Log in/out, user roles (admin, user, etc.)
2. Data Validation: ex. mail format, required fields, data type checks BEFORE SAVING TO DB
3. API Integration: 
    1. REST/JSON API: Create API endpoints to allow communication with the frontend, such as POST, GET, PUT, and DELETE operations
    2. External API Integration: fetch and save data to db
    3. One of the following either using (SOAP/XML) OR (REST/JSON):
        * One Web service that you implement using (SOAP/XML) OR (REST/JSON)
        * At least one Web service that generates an XML document or JSON
        * At least one Web service (SOAP/REST) that interacts with a database.
        * If using SOAP/XML: An XML document with a defined XML Schema that you
        implement A Web page that you implement which reads and displays the results
        from the XML document
        * If using REST/JSON: A web page that uses an external REST/JSON API (e.g.
        Twitter) At least two queries associated with the functionality (e.g. saving Tweets
        in the database)
4. CRUD Operations: Create, read, update, delete operations of entities in the db
5. Data Export: Export data to CSV or PDF (ex. Pandas)
6. Error Handling: mplement error-handling functions to manage database connection failures, wrong API inputs, or other exceptions.

## Front End
1. Two or more Web pages that you implement
    * Web pages will execute the 10 views from Phase II (Part C) and displaying the results in the proper tabular HTML format
2. Dynamic Forms: Create interactive forms with JavaScript or any to allow users to submit data dynamically (ex. form validation, auto-fill suggestions)
3. AJAX Requests: Use AJAX or Fetch API to interact with the backend without refreshing the page (for submitting forms or fetching data in real-time)
4. Data Visualization: Use libraries like Chart.js or D3.js to visualize data from MySQL queries on the frontend (ex. bar charts, line graphs)
5. Search and Filter Functionality: Provide the user with the ability to search and filter through records (ex. filtering by date, category, keyword, or id) using MySQL queries in the backend.

## Notes
* A detailed README document on how to install and execute your project 

# Plan
## Back End
* Use login protocol from PhotoNest
  * implement roles (all new registered users will always be user level, admin level must be specified somehow, either explicitly in the db or some other way)
* Validate input from javascript forms somehow
* REST/JSON - Create API endpoints to connect to front end (post, get, put, delete)
* fetch and save data to db from some sports API (find one that matches ER from phase 2)
* choose one of the 3.iii options (most likely generating XML doc / JSON)
* CRUD using mysql / php
* data export - find plugin / API to help
* error handling

## Front End
* Two (functional) pages minimum
  1. home / sample page
  2. compare page
  3. details page (or combine with compare page)
  * page must support the 10 views
    * have one box that scrolls between the views. ex. carousel
* form data - most likely for filtering players
  * autofill suggestions would be most useful here
* AJAX / Fetch API to prevent refreshing after selecting players / etc
* Allow player to search through records and filter (ex. filter by player, team, or stats)
