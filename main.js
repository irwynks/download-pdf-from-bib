var request = require('request').defaults({jar: true, headers:{'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0 Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0.'}});
var cj = request.jar();
var parsebib = require('bibtex-parse-js');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');

var ok = 0;
var nok = 0;
var exist = 0;

var existing = fs.readdirSync('./pdfs');

fs.readFile('./download.bib', 'utf8', function(err, contents) {

    if(err)
        console.log(err);

    var refs = parsebib.toJSON(contents);

    async.eachLimit(refs, 5, function(ref, cb){

        var exists = false;

        var url = ref.entryTags.url;

        var filename = ref.entryTags.title
            .replace(':','-')
            .replace(/{/gm,'')
            .replace(/}/gm,'')
            .replace(/\\/gm,' ')
            .replace(/\//gm,' ')
            .replace(/\?/gm,'');

        if(!ref.entryTags || !ref.entryTags.url){
            console.log(filename+' has no associated URL');
            nok+=1;
            return cb();
        }

        for(var i = 0; i<existing.length;i++){

            var file = existing[i];

            var defixed = file.replace('.pdf','');

            if(filename.match(defixed)){
                exist+=1;
                exists = true;
                console.log(defixed+' has already been downloaded.');
                break;
            }
        }

        if(exists)
            return cb();

        if(url.match('.acm')){
            request.get(url, function(err, resp, body){

                var $ = cheerio.load(body);

                var link = $('a[name="FullTextPDF"]').attr('href');
                var next = 'http://dl.acm.org/'+link;

                request.get({
                    url:next,
                    encoding:null
                }, function(err, resp, body){

                    fs.writeFileSync('./pdfs/'+filename+'.pdf', body, 'binary');

                    console.log(filename+' has been downloaded.');

                    ok+=1;

                    cb();

                });

            })

        }
        else if(url.match('ieee')){

            var num = url.split('/');
            num = num[num.length-2];
            var pdfurl = 'http://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber='+num;

            request.get({url:url, jar:cj}, function() {

                request.get({
                        url: pdfurl,
                        jar:cj
                    },
                    function (err, resp, body) {

                        var $ = cheerio.load(body);

                        var src = $($('iframe').toArray()[1]).attr('src');

                        request.get({
                            url:src,
                            encoding:null,
                            jar:cj
                        }, function(err, resp, body){

                            fs.writeFileSync('./pdfs/'+filename+'.pdf', body, 'binary');

                            console.log(filename+' has been downloaded.');

                            ok+=1;

                            cb();

                        });

                    });
            })
        }else{
            cb()
        }

    }, function(err){

        console.log(exist+' were already downloaded.');
        console.log(ok+' new pdfs downloaded.');
        console.log(nok+' refs with no URL.');
        console.log('Done.');

    });

});
