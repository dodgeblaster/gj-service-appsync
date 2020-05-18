var fs = require('fs');
var path = require('path');

const getDirectory = (_path, dirname, projectSrcFolder) => {
    return new Promise((res) => {
        var walk = function (dir, done) {
            var results = [];
            fs.readdir(dir, function (err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, results);
                list.forEach(function (file) {
                    file = path.resolve(dir, file);
                    fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function (err, res) {
                                results = results.concat(res);
                                if (!--pending) done(null, results);
                            });
                        } else {
                            results.push(file);
                            if (!--pending) done(null, results);
                        }
                    });
                });
            });
        };

        walk(_path, (_, x) => {
            let list = {
                'Query': [],
                'Mutation': []
            }

            if (!x) {
                res(list)
                return
            }

            const getPath = x => {
                const length = (dirname + projectSrcFolder + '/resolvers/').length
                return x.slice(length)
            }

            x.forEach(x => {
                const xx = getPath(x)
                if (xx.startsWith('Query')) {
                    const res = xx.split('/')[1]


                    if (res.split('').filter(x => x === '.').length === 1) {

                        const name = res
                        const format = res.includes('.js') ? 'JS'
                            : res.includes('.py')
                                ? 'PYTHON'
                                : 'UNSUPPORTED'

                        const type = 'Query'
                        const field = res.split('.')[0]
                        const path = './resolvers/Query/' + res
                        list.Query.push({
                            name,
                            format,
                            path,
                            type,
                            field
                        })
                    }
                }

                if (xx.startsWith('Mutation')) {
                    const res = xx.split('/')[1]

                    if (res.split('').filter(x => x === '.').length === 1) {

                        const name = res
                        const format = res.includes('.js') ? 'JS'
                            : res.includes('.py')
                                ? 'PYTHON'
                                : 'UNSUPPORTED'

                        const type = 'Mutation'
                        const field = res.split('.')[0]
                        const path = './resolvers/Query/' + res
                        list.Mutation.push({
                            name,
                            format,
                            path,
                            type,
                            field
                        })
                    }
                }
            })
            res(list)
        })
    })
}

module.exports = getDirectory