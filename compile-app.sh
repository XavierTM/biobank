
# clear the screen
clear

# compile react
cd ui
npm run build
cd ..

# overwrite mobile/www
rm -rf mobile/www
mkdir mobile/www
mv ui/build/* mobile/www

# compile react again
cd ui
npm run build
cd ..

# overwrite api/static
mkdir very-temp
mv api/static/.gitignore very-temp/
rm -rf api/static
mkdir api/static
mv very-temp/.gitignore api/static
rm -rf very-temp
mv ui/build/* api/static



# compile for android
cd mobile
cordova build android
cd ..

pwd