cd $(dirname $0)/../
git checkout master
git pull
bower install
tag="$(git describe --abbrev=0 --tags)"
sed "s/___VERSION___/$tag/g" package.template.json > package.json
cfx xpi
sleep 10
sed "s/___VERSION___/$tag/g" readme.template.md > readme.md
git add -A
git commit -m "build $tag"
git push
git push --tags