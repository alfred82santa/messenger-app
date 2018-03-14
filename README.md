# messenger-app
Messenger App

## Installation

 * Install Node and NPM
    * OSX:
    
        ```bash
        brew install node
        ```
    * Linux :
    
        ````bash
        curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
        sudo apt-get install -y nodejs
        ````

 * Install project dependencies
    * From the directory where `package.json` is placed, run:
    
        ```bash
        npm install
        ```
    
    * You can ignore these messages:
        
        ```bash
        npm notice created a lockfile as package-lock.json. You should commit this file.
        npm WARN backbone-react-component@1.0.0 requires a peer of react@^15.3.0 but none is installed. You must install peer dependencies yourself.
        npm WARN ajv-keywords@3.1.0 requires a peer of ajv@^6.0.0 but none is installed. You must install peer dependencies yourself.
        ```

## Start the client

* set the REACT_APP_BACKEND_URL value:

    ```bash
    export REACT_APP_BACKEND_URL='messenger-hub-dev.apps-dev.tid.es'
    ```
      
* run the client using npm:
    ```bash
    npm start
    ```
