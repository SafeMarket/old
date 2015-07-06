cd $(dirname $0)/../
git checkout master
git pull
bower install
tag="$(git describe --abbrev=0 --tags)"
sed "s/___VERSION___/$tag/g" package.template.json > package.json
cfx xpi
git add -A
git commit -m "build $tag"
git push