# Soccerats Soccer Stats
Simple HTML website to display, compare, and contrast stats for European Soccer Players, Teams, and Leagues. 

## Requirements
- NodeJs (latest version)

## How to run
### Clone the repo and install dependencies. You must be in a bash terminal to execute:
```bash
git clone -b main https://github.com/hashir-rashid/SoccerStatsDataApp.git
cd SoccerStatsDataApp/backend
npm install
```

### Download the database file  
Go to https://www.kaggle.com/datasets/hugomathien/soccer, and place it in the `backend/database/` directory. Ensure it is named `database.sqlite`. Failure to do so will result in the app not running. If a `database.sqlite` file already exists, please replace it with the one downloaded from the link above.

### Run the app
```node
npm start
```
