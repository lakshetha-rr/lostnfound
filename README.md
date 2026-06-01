# Lost & Found Portal

A web-based Lost and Found Management System developed using Flask and SQLite to help users report, track, and recover lost belongings efficiently.

## Live Demo

Website: https://lostnfound-z73l.onrender.com/

## GitHub Repository

Repository: https://github.com/lakshetha-rr/lostnfound

## Project Overview
The Lost & Found Portal provides a centralized platform where users can:

* Create an account and log in securely
* Report lost items with details and images
* Report found items with details and images
* Browse lost and found listings
* Submit claims for recovered items
* Track claim status
* Manage item records
* Access administrative functionalities for claim approval and rejection

## Features

### User Authentication

* User registration
* User login
* Session management
* Logout functionality

### Lost Item Management

* Report lost items
* Upload item images
* View all reported lost items
* Delete reported items

### Found Item Management

* Report found items
* Upload item images
* View all reported found items
* Delete reported items

### Claim Management

* Submit ownership claims
* Upload supporting proof
* Track claim status
* Admin approval/rejection workflow

### Admin Features

* Review submitted claims
* Approve valid claims
* Reject invalid claims

## Technology Stack

### Backend

* Python
* Flask

### Database

* SQLite

### Frontend

* HTML
* CSS
* JavaScript

### Deployment

* GitHub
* Render

## Project Structure

```text
lostnfound/
│
├── static/
├── templates/
├── app.py
├── database.db
├── requirements.txt
├── Procfile
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/lakshetha-rr/lostnfound.git
```

### Navigate to Project Folder

```bash
cd lostnfound
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Application

```bash
python app.py
```

### Open in Browser

```text
http://127.0.0.1:5000
```

## Future Enhancements

* Password hashing and encryption
* Email notifications
* Advanced search and filtering
* AI-based item matching
* Mobile-responsive design improvements
* Cloud database integration

## Author

**Lakshetha R R**
B.Tech Computer Science and Engineering
VIT Chennai

## Project Status

Successfully deployed and accessible online through Render.
