if [ -d "$node_modules"]; 
    then
        echo "Folder exists"
    else
        npm i
fi
cd Frontend/

if [ -d "$node_modules"]; 
    then
        echo "Folder exists"
    else
        npm 
fi
npm run build
cd ..
npm start