var needle = require('needle');
var cheerio = require('cheerio');
var config = require('../config');
var _ = require('lodash');
var urlResolve = require('url').resolve;
var Queue = require('promise-queue-plus');



var time = 3 * 1000;

needle.defaults({
    open_timeout: time,
    read_timeout: time,
    timeout: time,
    user_agent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; SV1; .NET CLR 1.1.4322)'
});

var Spider = function(opts) {
    Spider.prototype.init = _.merge(opts.init, {
        delay: 0,
        threads: 10
    });
    Spider.prototype.q = Queue.Promise;
    Spider.prototype.Q = new Queue(Spider.prototype.init.threads, {
        "retry": 0,
        "retryIsJump": false,
        "timeout": 0
    });
    Spider.prototype.rules = opts.rules || config;
    Spider.prototype.callback = opts.callback;
    if (opts.run) Spider.prototype.run();
    return Spider;
};

Spider.prototype.run = function(rules, results) {
    Spider.prototype.once(rules || this.rules, function(once) {
        console.log(once);
        Spider.prototype.get(once.url, function(jQuery) {
            Spider.prototype.once(once.rules, function(one) {
                if (one.list) {
                    console.info("[+] [" + once.url + "]运行规则中...");
                    // console.dir(one);
                    Spider.prototype.list({
                        spider: one,
                        $: jQuery,
                        url: once.url,
                        result: results
                    }, function(rule, result) {
                        // sleep(Spider.prototype.init.delay);
                        if (rule) {
                            Spider.prototype.run(rule, result);
                        } else {
                            Spider.prototype.callback(result);
                        }
                    });
                } else {
                    console.info("[+] [" + once.url + "]正在获取数据...");
                    Spider.prototype.one({
                        spider: one,
                        $: jQuery,
                        result: results
                    }, function(data) {
                        console.info("[+] [" + data.url + "]获取数据完成.");
                        Spider.prototype.callback(data);
                    });
                }
            });
        });
    });
    return Spider;
};

Spider.prototype.list = function(options, cb) {
    var list = [];
    options.$(options.spider.list).each(function() {
        var one = {};
        for (var k in options.spider.rule) {
            switch (options.spider.rule[k].type) {
                case 'text':
                    one[k] = options.$(this).find(options.spider.rule[k].text).text();
                    break;

                case 'html':
                    one[k] = options.$(this).find(options.spider.rule[k].text).html();
                    break;

                case 'val':
                    one[k] = options.$(this).find(options.spider.rule[k].text).val();
                    break;

                default:
                    one[k] = options.$(this).find(options.spider.rule[k].text).attr(options.spider.rule[k].type);
                    break;
            }
        }
        if (options.spider.link) {
            Spider.prototype.once(options.spider.link, function(once) {
                // sleep(Spider.prototype.init.delay);
                once.url = one.url = url(options.url, one.url);
                cb(once, one);
            });
        }
        list.push(one);
    });
    if (!options.spider.link) {
        var l = {};
        l[options.spider.key] = list;
        list = _.merge(options.result, l);
        cb(false, list);
    }
};

Spider.prototype.one = function(options, cb) {
    // console.trace();
    var one = {};
    for (var k in options.spider.rule) {
        switch (options.spider.rule[k].type) {
            case 'text':
                one[k] = options.$(options.spider.rule[k].text).text();
                break;

            case 'html':
                one[k] = options.$(options.spider.rule[k].text).html();
                break;

            case 'val':
                one[k] = options.$(options.spider.rule[k].text).val();
                break;

            default:
                one[k] = options.$(options.spider.rule[k].text).attr(options.spider.rule[k].type);
                break;
        }
    }
    one = _.merge(options.result, one);
    cb(one);
};

Spider.prototype.get = function(url, cb) {
    console.time("[+] [" + url + "]网页获取时间");
    needle.get(url, function(err, res) {
        if (!err) {
            try {
                console.info("[+] [" + url + "]页面处理完成.");
                cb(cheerio.load(res.body));
            } catch (e) {
                console.error("[-] [" + url + "]页面处理失败: ", e);
            }
        } else {
            console.error("[-] [" + url + "]网页访问错误: ", err);
        }
        console.timeEnd("[+] [" + url + "]网页获取时间");
    });
};

Spider.prototype.once = function(more, cb) {
    if (_.isArray(more)) {
        more.forEach(function(once) {
            // console.info(once);
            cb(once);
        });
    } else {
        // console.info(more);
        cb(more);
    }
};

Spider.prototype.queue = function(url) {
    queue1.go(function(uri) {
        new Promise(function(resolve, reject) {
            if (Spider.prototype.init.delay == 0) {
                resolve(uri);
            } else {
                setTimeout(function() {
                    resolve(uri);
                }, Spider.prototype.init.delay);
            }
        });
    }, [url]).then(console.log);
};


exports = module.exports = Spider;

function url(url, t) {
    return /^https?:/.test(t) ? this : urlResolve(url, t);
}

function sleep(delay) {
    var start = new Date().getTime();
    var sleep = delay || 200;
    while (new Date().getTime() < start + sleep) {}
}

function testfun(i) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(i)
        }, 300)
    })
}