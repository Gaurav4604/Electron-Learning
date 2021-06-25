// importing electron
const electron = require('electron');

const ffmpeg = require('fluent-ffmpeg');

// provides all the lifecycle events
const {app, BrowserWindow, ipcMain} = electron;

// defining the mainWindow globally
let mainWindow;

app.on('ready', () => { // event based programming
    console.log('App is now ready');

    // to spawn a new window to project content onto
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
});

// first argument is always the window object,
// second argument will be the argument sent via the frontend

ipcMain.on('video:submit', (event, path) => {
    console.log(`the video path is -> ${path}`);
    ffmpeg.ffprobe(path, (err, metadata) => {
        console.log('Video Duration is: ',metadata.format.duration, ' seconds');

        mainWindow.webContents.send('video:duration', metadata.format.duration);
    })
});