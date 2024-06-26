# Tarea 3 PWA: Notewes 
This repository includes a PWA for writing anonymous notes. The project is based on [Anonynote](https://anonynote.org/). Since this is a PWA, you can install it on your device by clicking the computer icon on your browser's search bar.

This app uses the Cache API, IndexedDB API, and the Notifications API through Firebase Cloud Messaging. 

Right now the app is deployed on <https://iic3585-2024.github.io/pwa-group-07/>, so you can visit the website and test it.

## Development
You can test the app locally by serving the files over the `frontend/` directory and serving the backend on the directory with the same name. First, to serve the frontend files you can use a python server by running the following command inside the `frontend/` folder:
```bash
python3 -m http.server
```
Second, you have to serve the backend by running the following command inside the `backend/` folder:
```bash
npm run start
```
Now the app will be available on `localhost:8000`. If you want to change the url of the backend in the frontend app, go to `frontend/scripts/notes.js` and change the `API URL` variable at the start of the code.


>[!NOTE]
>It is possible that the browser does not allow the requests from frontend to the backend because it is an http server, instead of https. For allowing the requests in Chrome, go to chrome://flags/#unsafely-treat-insecure-origin-as-secure in the browser and type the URL for the server (`http://localhost:3000`, for example).

>[!NOTE]
> If you are using Brave as your browser you may not be able to see the notifications that are sent. This happens because Brave has Google push notifications services disabled by default. To enable it you need to open `brave://settings/privacy` and click look for the “Use Google services for push messaging” flag.
