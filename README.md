# Secured File Share

# Getting Started
To get a local copy up and running, follow these simple steps.

# Prerequisites
- Node.js
- Internet connection

# Installation

1. Clone the repo
```
https://github.com/SumitKumar-17/Secure-File-Share.git
```

2. Enter your environment variables in .env on the server
```
MONGO_URI="your_mongo_db_link"
USER="your_personal_email_id"
PASS="your_google_account_pass_for_mailing"
AZURE_STORAGE_ACCOUNT_NAME="azure_storage_accout_name"
AZURE_STORAGE_SAS_URL="your_azure_storage_sas_url"
AZURE_BLOB_STORAGE_CONTAINER_NAME="azure_storage_container_name"

```

3. Enter your environment variables in .env on the client
```
VITE_CLERK_PUBLISHABLE_KEY="your_clerk_key"
```

4. Open a terminal in the root of your project and run:
```
npm install
node app.js
```
4. Open a terminal in the /client of your project and run:
```
npm install
npm run dev
```

# Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
