const electron = require("electron");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow, todoControllerWindow;
let addFlag = true, deleteFlag = true;

let TodoList = [];

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
  });
  mainWindow.loadURL(`file://${__dirname}/Pages/main.html`);

  // applying the menu built to the app
  const mainMenu = Menu.buildFromTemplate(MenuTemplate);
  Menu.setApplicationMenu(mainMenu);
  // to close the app if the main window is closed
  mainWindow.on("closed", () => app.quit());
});

function createAddWindow() {
  todoControllerWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add new Todo",
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    }
  });
  todoControllerWindow.loadURL(`file://${__dirname}/Pages/TodoController.html`);
  todoControllerWindow.webContents.send('todo:loadAddWindow');
  todoControllerWindow.on("closed", () => {
    addFlag = true;
      // to free up the space used by this window
      todoControllerWindow = null;
  })
}

function createDeleteWindow() {
    todoControllerWindow = new BrowserWindow({
      width: 300,
      height: 200,
      title: "Delete Todo",
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true
      }
    });
    todoControllerWindow.loadURL(`file://${__dirname}/Pages/TodoController.html`);
    todoControllerWindow.webContents.send('todo:loadDeleteWindow', TodoList);
    todoControllerWindow.on("closed", () => {
        deleteFlag = true;
        // to free up the space used by this window
        todoControllerWindow = null;
    })
  }

ipcMain.on('todo:add', (event, todo) => {
    TodoList.push(todo);
    mainWindow.webContents.send('todo:sendToMainWindow', todo);
    todoControllerWindow.close();
}) 

ipcMain.on('todo:delete', (event, todoList) => {
    TodoList = todoList;
    mainWindow.webContents.send('todo:updatedList', TodoList);
    todoControllerWindow.close();
}) 

const MenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "New Todo",
        accelerator: process.platform == "darwin" ? "Cmd+Plus" : "Ctrl+Plus",
        click() {
          if(addFlag){
            createAddWindow();
            addFlag = false;
          }
        },
      },
      {
        label: "Delete Todo",
        accelerator: process.platform == "darwin" ? "Cmd+-" : "Ctrl+-",
        click() {
          if(deleteFlag){
            createDeleteWindow();
            deleteFlag = false;
          }
        },
      },
      {
        label: "Quit",
        // hotkey functionality
        accelerator: process.platform == "darwin" ? "Cmd+Q" : "Alt+F4",
        // function triggered when the particular submenu button is clicked
        click() {
          app.quit();
        },
      },
    ],
  },
];

if (process.platform == "darwin")
  MenuTemplate.unshift({
    label: "",
  });

// to check if the app is run in development mode or not
if (process.env.NODE_ENV !== "production") {
  MenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle Developer Tools",
        accelerator: process.platform == "darwin" ? "Cmd+F12" : "Ctrl+F12",
        // focused Window helps to toggle dev tools for the selected window
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        // preset on electron to reload the window
        role: 'reload'
      }
    ],
  });
}
