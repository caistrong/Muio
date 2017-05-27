/**
 * Created by caistrong on 17-5-27.
 */
var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');


var app = express();

//设置模板目录
app.set('views',path.join(__dirname,'views'));
//设置模版引擎
app.set('view engine','ejs');

//设置静态文件目录
app.use(express.static(path.join(__dirname,'public')));
//session中间件
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave:true,//????
    saveUninitialized:false,//???
    cookie:{
        maxAge:config.session.maxAge
    },
    store:new MongoStore({
        url:config.mongodb //mongodb 地址
    })
}));

//flash 中间件
app.use(flash());

app.use(require('express-formidable')({
    uploadDir:path.join(__dirname,'public/img'),
    keepExtensions:true
}))

//设置模板全局常量
app.locals.blog = {
    title:pkg.name,
    description:pkg.description
};

//添加模板必需的三个变量
app.use(function (req,res,next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});
// 正常请求的日志
app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));
// 路由
routes(app);//????这行代码含义是???
// 错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));
// error page
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});
app.listen(config.port,function () {
    console.log('${pkg.name} listening on port ${config.port}');
});