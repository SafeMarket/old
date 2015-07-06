if [[ $# -eq 0 ]] ; then
    echo 'missing tag'
    exit 0
fi

cd $(dirname $0)/../
git checkout master
git pull
bower install
tag="$1"
sed "s/___VERSION___/$tag/g" package.template.json > package.json
echo $tag > data/version
cfx xpi --output-file="builds/safemarket-$tag.xpi"
sed "s/___VERSION___/$tag/g" readme.template.md > readme.md
git add -A
git commit -m "build $tag"
git tag "$tag"
git push
git push --tags