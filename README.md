# Chat Application Client

This is the client of a chat application, built by React framework of javascript. It communicates with the server located [here](https://github.com/oril1234/Chat-Application-Server) using HTTP and Websocket protocols. The communication through Websocket is performed using instances of the library socket.io both in the client and the server, and thus real time updates between clients connected to the server are possible.
The data fetched from the server in the client is managed using Redux store, which is accessible to multiple components in the application, what makes it reactive.
The following actions are supported in the client:
1. Signing up and logging in to the application
2. Send and receive text messages in private chats of 2 users, and group chats with multiple participants, all in real time.
3. View chats partner connection status
4. View chats partners details
5. View user's groups details
6. Create new groups
7. Adding new members to groups and informing them in real time
8. Removing members from groups by its admin and informing them in real time
9. Closing a group, meaning no messages can be sent in it anymore. The members are informed about the closure in real time.
10. Self exit from group of a member
11. Block and unblock users and informing them in real time

Below is a high level diagram of the client:
![_דיאגרמה ללא שם_ drawio (3)](https://user-images.githubusercontent.com/49225452/236952091-250a2770-9f3f-41c1-a152-f52f1958cba9.png)



This is a detailed hierarchy of the components:
![_דיאגרמה ללא שם_ drawio (1)](https://user-images.githubusercontent.com/49225452/236952193-213cbe18-2046-4951-93e6-d8b4e02c9c8f.png)


## Setup And Installation
Clone down this repository. You will need node and npm installed globally on your machine.

Installation:

`npm install`

`npm install react-router-dom`

`npm install @material-ui/core`


To Start Application:

`npm start`

then run the URL http://localhost:3000/


